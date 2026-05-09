'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { EllipsisVerticalIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  deleteListing,
  saveListing,
  toggleListingStatus,
} from '@/lib/listings/actions'
import type {
  Auto,
  Gadget,
  ListingFormValues,
  ListingKind,
  ListingRecord,
  Property,
  SaveListingPayload,
} from '@/lib/listings/types'
import {
  uploadMultipleAutoImages,
  uploadMultipleImages,
  uploadMultiplePropertyImages,
  uploadVideoToCloudinary,
} from '@/lib/uploadMedia'

type Message = {
  text: string
  type: 'success' | 'error'
}

type Props = {
  // The page passes which listing category this manager should display.
  kind: ListingKind
  // These records are loaded by the parent route and rendered in the table.
  initialListings: ListingRecord[]
}

// Page heading text changes based on the listing category being managed.
const titles: Record<ListingKind, string> = {
  gadgets: 'Gadgets - All Listings',
  autos: 'Autos - All Listings',
  'real-estate': 'Real Estate - All Listings',
}

// Button labels also change by category, but the rest of the UI stays shared.
const ctaLabels: Record<ListingKind, string> = {
  gadgets: '+ Upload New Gadget',
  autos: '+ Upload New Auto',
  'real-estate': '+ Upload New Property',
}

// Builds the blank form shape for the current listing type.
function defaultForm(kind: ListingKind): ListingFormValues {
  if (kind === 'gadgets') {
    return {
      name: '',
      category: 'iphone',
      condition: 'new',
      storage: '',
      price: '',
      description: '',
    }
  }

  if (kind === 'autos') {
    return {
      name: '',
      make: '',
      model: '',
      year: '',
      condition: 'Foreign',
      mileage: '',
      price: '',
      description: '',
    }
  }

  return {
    name: '',
    type: 'House',
    location: '',
    bedrooms: '',
    price: '',
    description: '',
  }
}

// Converts an existing database record into editable form values.
function formFromListing(kind: ListingKind, item: ListingRecord): ListingFormValues {
  if (kind === 'gadgets') {
    // Narrow the shared ListingRecord type so TypeScript knows gadget-only fields exist.
    const gadget = item as Gadget
    return {
      name: gadget.name,
      category: gadget.category.toLowerCase(),
      condition: gadget.condition.toLowerCase(),
      storage: gadget.storage || '',
      price: String(gadget.price),
      description: gadget.description || '',
    }
  }

  if (kind === 'autos') {
    // Narrow to Auto so fields like make, model, mileage, and year can be read safely.
    const auto = item as Auto
    return {
      name: auto.name,
      make: auto.make || '',
      model: auto.model || '',
      year: auto.year ? String(auto.year) : '',
      condition: auto.condition || 'Foreign',
      mileage: auto.mileage || '',
      price: String(auto.price),
      description: auto.description || '',
    }
  }

  // If it is not gadgets or autos, this manager is rendering real estate listings.
  const property = item as Property
  return {
    name: property.name,
    type: property.type || 'House',
    location: property.location || '',
    bedrooms: property.bedrooms ? String(property.bedrooms) : '',
    price: String(property.price),
    description: property.description || '',
  }
}

// Formats prices for table display, shortening million-plus values to "1.5M".
function priceLabel(value: number) {
  if (value >= 1000000) return `NGN ${(value / 1000000).toFixed(1)}M`
  return `NGN ${value.toLocaleString()}`
}

// Empty-state text for the table when a category has no records.
function emptyLabel(kind: ListingKind) {
  if (kind === 'gadgets') return 'No gadgets listed yet'
  if (kind === 'autos') return 'No autos listed yet'
  return 'No properties listed yet'
}

// User-facing text for the availability badge.
function statusText(isAvailable: boolean) {
  return isAvailable ? 'Available' : 'Sold'
}

// User-facing text for the button that flips availability.
function actionText(isAvailable: boolean) {
  return isAvailable ? 'Mark Sold' : 'Mark Available'
}

export default function ListingManager({ kind, initialListings }: Props) {
  // App Router helper used to re-fetch the current route after mutations.
  const router = useRouter()

  // Modal, form, file, message, and dropdown state all live in this client component.
  const [showModal, setShowModal] = useState(false)
  const [editingListing, setEditingListing] = useState<ListingRecord | null>(null)
  const [form, setForm] = useState<ListingFormValues>(() => defaultForm(kind))
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [message, setMessage] = useState<Message>({ text: '', type: 'success' })
  const [uploading, setUploading] = useState('')
  const [videoProgress, setVideoProgress] = useState(0)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Only attach global listeners while a mobile action menu is open.
    if (!openMenuId) return

    // Close the action menu when the user clicks anywhere outside it.
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.action-dropdown')) setOpenMenuId(null)
    }

    // Close the action menu when the user presses Escape.
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenuId(null)
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleEsc)

    // Remove listeners when the menu closes or the component unmounts.
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [openMenuId])

  function resetModal() {
    // Return the modal to a clean "create listing" state.
    setShowModal(false)
    setEditingListing(null)
    setForm(defaultForm(kind))
    setImages([])
    setVideo(null)
    setUploading('')
    setVideoProgress(0)
    setMessage({ text: '', type: 'success' })

    // File inputs cannot be controlled like normal text inputs, so clear them with refs.
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  function openCreateModal() {
    // Open a blank form for adding a new listing.
    setEditingListing(null)
    setForm(defaultForm(kind))
    setMessage({ text: '', type: 'success' })
    setShowModal(true)
  }

  function openEditModal(item: ListingRecord) {
    // Store the selected record and pre-fill the form with its current values.
    setEditingListing(item)
    setForm(formFromListing(kind, item))
    setMessage({ text: '', type: 'success' })
    setShowModal(true)
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    // All form fields use their "name" attribute as the key in the shared form object.
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function uploadMedia(): Promise<Pick<SaveListingPayload, 'imageUrls' | 'video'>> {
    let imageUrls: string[] = []

    if (images.length) {
      setUploading(`Uploading ${images.length} image(s)...`)

      // Each listing category uploads to its own Cloudinary folder/helper.
      if (kind === 'gadgets') imageUrls = await uploadMultipleImages(images)
      if (kind === 'autos') imageUrls = await uploadMultipleAutoImages(images)
      if (kind === 'real-estate') imageUrls = await uploadMultiplePropertyImages(images)
    }

    // Listings can be saved without a video, so return null when none was selected.
    if (!video) return { imageUrls, video: null }

    setUploading('Uploading video...')
    // The upload helper calls setVideoProgress so the progress bar can update.
    const uploadedVideo = await uploadVideoToCloudinary(video, setVideoProgress)
    return { imageUrls, video: uploadedVideo }
  }

  async function handleSubmit(event: React.FormEvent) {
    // Prevent the browser from doing a full page form submission.
    event.preventDefault()
    setMessage({ text: '', type: 'success' })
    setUploading('')

    try {
      // Upload selected files first, then send form values plus media URLs to the server action.
      const media = await uploadMedia()
      const result = await saveListing(kind, { values: form, ...media }, editingListing?.id)

      if (!result.success) {
        setMessage({ text: result.message, type: 'error' })
        return
      }

      setMessage({ text: result.message, type: 'success' })
      resetModal()
      // Ask Next.js to fetch fresh Server Component data for this route.
      router.refresh()
    } catch (error) {
      // Show a readable error even if the thrown value is not an Error object.
      setMessage({
        text: error instanceof Error ? error.message : 'Unable to save listing.',
        type: 'error',
      })
    }
  }

  function handleToggle(item: ListingRecord) {
    // useTransition keeps the UI responsive while the server action updates availability.
    startTransition(async () => {
      const result = await toggleListingStatus(kind, item.id, item.is_available)
      if (!result.success) setMessage({ text: result.message, type: 'error' })
      router.refresh()
    })
  }

  function handleDelete(item: ListingRecord) {
    // Browser confirmation prevents accidental deletes.
    if (!confirm(`Delete "${item.name}"?`)) return

    startTransition(async () => {
      const result = await deleteListing(kind, item.id)
      if (!result.success) setMessage({ text: result.message, type: 'error' })
      router.refresh()
    })
  }

  function renderRows() {
    // Each listing category has different columns, so rows are rendered per category.
    if (kind === 'gadgets') {
      return (initialListings as Gadget[]).map((item) => (
        <tr key={item.id}>
          <td>{item.name}</td>
          <td><span className="badge b-gadget">{item.category}</span></td>
          <td><span className={`badge ${item.condition === 'New' ? 'b-new' : 'b-used'}`}>{item.condition === 'Used' ? 'UK Used' : item.condition}</span></td>
          <td>{item.storage || '-'}</td>
          <td>{priceLabel(item.price)}</td>
          <td><span className={`badge ${item.is_available ? 'b-live' : 'b-hidden'}`}>{statusText(item.is_available)}</span></td>
          <td style={{ position: 'relative' }}>{renderActions(item)}</td>
        </tr>
      ))
    }

    if (kind === 'autos') {
      return (initialListings as Auto[]).map((item) => (
        <tr key={item.id}>
          <td>{item.name}</td>
          <td>{item.year || '-'}</td>
          <td>{item.make}</td>
          <td><span className={`badge ${item.condition === 'Foreign' ? 'b-new' : 'b-used'}`}>{item.condition}</span></td>
          <td>{priceLabel(item.price)}</td>
          <td><span className={`badge ${item.is_available ? 'b-live' : 'b-hidden'}`}>{statusText(item.is_available)}</span></td>
          <td style={{ position: 'relative' }}>{renderActions(item)}</td>
        </tr>
      ))
    }

    return (initialListings as Property[]).map((item) => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td><span className="badge b-estate">{item.type}</span></td>
        <td>{item.location}</td>
        <td>{item.bedrooms || '-'}</td>
        <td>{priceLabel(item.price)}</td>
        <td><span className={`badge ${item.is_available ? 'b-live' : 'b-hidden'}`}>{statusText(item.is_available)}</span></td>
        <td style={{ position: 'relative' }}>{renderActions(item)}</td>
      </tr>
    ))
  }

  function renderActions(item: ListingRecord) {
    return (
      <>
        {/* Mobile/tablet action trigger. It opens the centered dropdown menu below. */}
        <button
          className="mobile-menu-btn"
          onClick={(event) => {
            // Stop this click from immediately being handled by the outside-click listener.
            event.stopPropagation()
            setOpenMenuId(openMenuId === item.id ? null : item.id)
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          type="button"
        >
          <EllipsisVerticalIcon className="w-5 h-5" style={{ color: '#6b7280' }} />
        </button>

        {/* Desktop shows the actions inline so users do not need to open a menu. */}
        <div className="desktop-actions" style={{ display: 'flex', gap: '8px' }}>
          <button className="abtn a-edit" onClick={() => openEditModal(item)} type="button">Edit</button>
          <button className="abtn a-tog" onClick={() => handleToggle(item)} disabled={isPending} type="button">
            {actionText(item.is_available)}
          </button>
          <button className="abtn a-del" onClick={() => handleDelete(item)} disabled={isPending} type="button">Del</button>
        </div>

        {openMenuId === item.id && (
          <>
            {/* Invisible overlay lets a click outside the dropdown close the menu. */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setOpenMenuId(null)} />
            <div className="action-dropdown" style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              minWidth: '170px',
              overflow: 'hidden',
              padding: '8px 0',
            }} onClick={(event) => event.stopPropagation()}>
              {/* Mobile menu versions of the same edit, toggle, and delete actions. */}
              <button onClick={() => { openEditModal(item); setOpenMenuId(null) }} style={dropdownStyle} type="button">
                <PencilIcon className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => { handleToggle(item); setOpenMenuId(null) }} style={dropdownStyle} type="button">
                <EyeIcon className="w-4 h-4" /> {actionText(item.is_available)}
              </button>
              <button onClick={() => { handleDelete(item); setOpenMenuId(null) }} style={{ ...dropdownStyle, background: '#fef2f2', color: '#dc2626' }} type="button">
                <TrashIcon className="w-4 h-4" /> Delete
              </button>
            </div>
          </>
        )}
      </>
    )
  }

  function renderHeaders() {
    // Header columns mirror renderRows so each category table lines up correctly.
    if (kind === 'gadgets') {
      return (
        <tr>
          <th style={{ width: '25%' }}>Name</th>
          <th style={{ width: '11%' }}>Type</th>
          <th style={{ width: '10%' }}>Condition</th>
          <th style={{ width: '10%' }}>Storage</th>
          <th style={{ width: '14%' }}>Price</th>
          <th style={{ width: '10%' }}>Status</th>
          <th style={{ width: '20%' }}>Actions</th>
        </tr>
      )
    }

    if (kind === 'autos') {
      return (
        <tr>
          <th style={{ width: '25%' }}>Name</th>
          <th style={{ width: '10%' }}>Year</th>
          <th style={{ width: '10%' }}>Make</th>
          <th style={{ width: '12%' }}>Condition</th>
          <th style={{ width: '15%' }}>Price</th>
          <th style={{ width: '10%' }}>Status</th>
          <th style={{ width: '18%' }}>Actions</th>
        </tr>
      )
    }

    return (
      <tr>
        <th style={{ width: '22%' }}>Property</th>
        <th style={{ width: '10%' }}>Type</th>
        <th style={{ width: '14%' }}>Location</th>
        <th style={{ width: '10%' }}>Beds</th>
        <th style={{ width: '14%' }}>Price</th>
        <th style={{ width: '10%' }}>Status</th>
        <th style={{ width: '20%' }}>Actions</th>
      </tr>
    )
  }

  return (
    <div>
      {/* Section title plus the category-specific create button. */}
      <div className="sec-hdr">
        <span className="sec-title">{titles[kind]}</span>
        <button className="sec-btn" onClick={openCreateModal} type="button">{ctaLabels[kind]}</button>
      </div>

      {/* Show success/error messages outside the modal after table-level actions. */}
      {message.text && !showModal && (
        <div className="card" style={{
          marginBottom: 14,
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#15803d' : '#b91c1c',
        }}>
          {message.text}
        </div>
      )}

      <div className="card" style={{ overflowX: 'auto' }}>
        {/* Table area switches between loading, empty state, and populated table. */}
        {isPending ? (
          <LoadingSpinner message="Updating listings..." />
        ) : initialListings.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>{emptyLabel(kind)}</div>
        ) : (
          <table style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>{renderHeaders()}</thead>
            <tbody>{renderRows()}</tbody>
          </table>
        )}
      </div>

      {showModal && (
        // Full-screen overlay. Clicking the shaded area closes and resets the modal.
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={resetModal}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 16,
            width: '95%',
            maxWidth: 440,
            maxHeight: '90vh',
            overflowY: 'auto',
            color: '#333',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>{editingListing ? 'Edit Listing' : ctaLabels[kind].replace('+ ', '')}</h2>
              <button onClick={resetModal} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer' }} type="button">x</button>
            </div>

            {/* Show form-specific success/error messages inside the modal. */}
            {message.text && (
              <div style={{
                padding: '10px',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
                background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#15803d' : '#b91c1c',
              }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Category-specific text/select fields are generated below. */}
                {renderFormFields(kind, form, handleChange)}

                <div>
                  <label style={labelStyle}>Images</label>
                  <div style={dropzoneStyle}>
                    {/* Multiple selected images are stored in state until submit uploads them. */}
                    <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={(event) => event.target.files && setImages(Array.from(event.target.files))} style={{ fontSize: 14 }} />
                    {images.length > 0 && <p style={selectedFileStyle}>{images.length} image(s) selected</p>}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Video</label>
                  <div style={dropzoneStyle}>
                    {/* The selected video is stored locally, then uploaded during handleSubmit. */}
                    <input ref={videoInputRef} type="file" accept="video/*" onChange={(event) => event.target.files && setVideo(event.target.files[0])} style={{ fontSize: 14 }} />
                    {video && <p style={selectedFileStyle}>{video.name}</p>}
                  </div>
                </div>

                {/* Progress bar only appears while a video upload is in progress. */}
                {videoProgress > 0 && videoProgress < 100 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#374151' }}>Uploading video...</span>
                      <span style={{ fontSize: 12, color: '#1A4FA0', fontWeight: 500 }}>{videoProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${videoProgress}%`, height: '100%', background: '#1A4FA0', borderRadius: 3, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}

                {uploading && <p style={{ fontSize: 13, color: '#1A4FA0', fontWeight: 500 }}>{uploading}</p>}

                {/* Submit button text changes for create, edit, and pending states. */}
                <button className="sec-btn" disabled={isPending} type="submit" style={{ justifyContent: 'center', padding: '14px' }}>
                  {isPending ? 'Saving...' : editingListing ? 'Save Changes' : ctaLabels[kind].replace('+ ', '')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Shared inline style for buttons inside the mobile action dropdown.
const dropdownStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  padding: '12px 14px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '13px',
  color: '#374151',
  fontWeight: 500,
}

// Shared label style used by all form helper functions.
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  marginBottom: 4,
  fontWeight: 500,
  color: '#374151',
}

// Shared text/select/textarea styling keeps all fields visually consistent.
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: 14,
  background: '#f9fafb',
}

// Shared styling for the image and video file input areas.
const dropzoneStyle: React.CSSProperties = {
  border: '2px dashed #d1d5db',
  borderRadius: 8,
  padding: 16,
  textAlign: 'center',
  background: '#f9fafb',
}

// Small text below file inputs showing what the user selected.
const selectedFileStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#1A4FA0',
  marginTop: 8,
  fontWeight: 500,
}

// Reusable text/number input builder for the different listing forms.
function field(
  label: string,
  name: keyof ListingFormValues,
  value: string | undefined,
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
  options?: { type?: string; placeholder?: string }
) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        name={name}
        type={options?.type || 'text'}
        placeholder={options?.placeholder}
        value={value || ''}
        onChange={onChange}
        style={inputStyle}
      />
    </div>
  )
}

// Reusable select builder for fields with fixed options.
function selectField(
  label: string,
  name: keyof ListingFormValues,
  value: string | undefined,
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
  options: string[]
) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select name={name} value={value || ''} onChange={onChange} style={inputStyle}>
        {options.map((option) => (
          <option value={option} key={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}

// Reusable textarea builder for the listing description.
function descriptionField(
  value: string,
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
) {
  return (
    <div>
      <label style={labelStyle}>Description</label>
      <textarea
        name="description"
        placeholder="Additional details..."
        value={value}
        onChange={onChange}
        rows={3}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
    </div>
  )
}

// Chooses the correct group of form fields for the current listing category.
function renderFormFields(
  kind: ListingKind,
  form: ListingFormValues,
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
) {
  if (kind === 'gadgets') {
    // Gadgets need category, condition, storage, price, and description fields.
    return (
      <>
        {field('Product Name *', 'name', form.name, onChange, { placeholder: 'e.g. iPhone 15 Pro Max' })}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>{selectField('Category', 'category', form.category, onChange, ['iphone', 'laptop', 'tablet', 'accessory'])}</div>
          <div style={{ flex: 1 }}>{selectField('Condition', 'condition', form.condition, onChange, ['new', 'used'])}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>{field('Storage', 'storage', form.storage, onChange, { placeholder: '256GB' })}</div>
          <div style={{ flex: 1 }}>{field('Price (NGN) *', 'price', form.price, onChange, { type: 'number', placeholder: '1350000' })}</div>
        </div>
        {descriptionField(form.description, onChange)}
      </>
    )
  }

  if (kind === 'autos') {
    // Autos need vehicle-specific fields like make, model, year, and mileage.
    return (
      <>
        {field('Listing Name *', 'name', form.name, onChange, { placeholder: 'e.g. Toyota Camry Full Option' })}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>{field('Make *', 'make', form.make, onChange, { placeholder: 'Toyota' })}</div>
          <div style={{ flex: 1 }}>{field('Model', 'model', form.model, onChange, { placeholder: 'Camry' })}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>{field('Year', 'year', form.year, onChange, { type: 'number', placeholder: '2020' })}</div>
          <div style={{ flex: 1 }}>{selectField('Condition', 'condition', form.condition, onChange, ['Foreign', 'Nigerian'])}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>{field('Mileage (km)', 'mileage', form.mileage, onChange, { placeholder: '50000' })}</div>
          <div style={{ flex: 1 }}>{field('Price (NGN) *', 'price', form.price, onChange, { type: 'number', placeholder: '18500000' })}</div>
        </div>
        {descriptionField(form.description, onChange)}
      </>
    )
  }

  // Real estate listings need property-specific fields like type, location, and bedrooms.
  return (
    <>
      {field('Property Name *', 'name', form.name, onChange, { placeholder: 'e.g. 3-Bed Terrace Lekki' })}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>{selectField('Type *', 'type', form.type, onChange, ['House', 'Land', 'Commercial', 'Apartment'])}</div>
        <div style={{ flex: 1 }}>{field('Location *', 'location', form.location, onChange, { placeholder: 'Lekki, Lagos' })}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>{field('Bedrooms', 'bedrooms', form.bedrooms, onChange, { type: 'number', placeholder: '3' })}</div>
        <div style={{ flex: 1 }}>{field('Price (NGN) *', 'price', form.price, onChange, { type: 'number', placeholder: '85000000' })}</div>
      </div>
      {descriptionField(form.description, onChange)}
    </>
  )
}
