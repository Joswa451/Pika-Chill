import { useEffect, useMemo, useState } from 'react'
import { useProducts } from '../../features/products/useProducts'
import { useCategories } from '../../features/categories/useCategories'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const emptyForm = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  is_available: true,
  category_id: ''
}

function formatPeso(value) {
  return `₱${(Number(value) || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
}

function AdminProducts() {
  const {
    products,
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
    loading: productsLoading,
    error: productsError
  } = useProducts()

  const {
    categories,
    fetchCategories,
    loading: categoriesLoading,
    error: categoriesError
  } = useCategories()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  useEffect(() => {
    fetchProducts().catch(() => {})
    fetchCategories().catch(() => {})
  }, [fetchCategories, fetchProducts])

  function openAddForm() {
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
    setPreviewUrl('')
    setFormError('')
    setIsFormOpen(true)
  }

  function openEditForm(product) {
    setEditingId(product.id)
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      image_url: product.image_url || '',
      is_available: Boolean(product.is_available),
      category_id: product.category_id || ''
    })
    setImageFile(null)
    setPreviewUrl('')
    setFormError('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
    setPreviewUrl('')
    setFormError('')
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === 'checkbox' ? checked : value
    }))
    setFormError('')
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null
    setFormError('')

    if (!file) {
      setImageFile(null)
      setPreviewUrl('')
      return
    }

    setImageFile(null)
    setPreviewUrl('')

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFormError('Choose a JPG, PNG, or WebP image.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFormError('Choose an image that is 5 MB or less.')
      event.target.value = ''
      return
    }

    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    setIsSaving(true)

    try {
      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        is_available: form.is_available,
        category_id: form.category_id || null
      }

      if (editingId) {
        await editProduct(editingId, productData, imageFile)
      } else {
        await addProduct(productData, imageFile)
      }

      closeForm()
    } catch (err) {
      setFormError(err.message || 'Could not save the product.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"?`
    )

    if (!confirmed) return

    try {
      await removeProduct(product.id)
    } catch {
      // useProducts exposes the error through productsError.
    }
  }

  function getCategoryName(categoryId) {
    const category = categories.find((item) => String(item.id) === String(categoryId))
    return category?.name || 'Uncategorized'
  }

  const error = productsError || categoriesError
  const loading = productsLoading || categoriesLoading
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = categoryFilter === 'all' || String(product.category_id) === categoryFilter
    const matchesText = `${product.name || ''} ${product.description || ''}`.toLowerCase().includes(query.trim().toLowerCase())
    return matchesCategory && matchesText
  }), [products, categoryFilter, query])

  return (
    <section>
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-[2rem]">Products</h1>
          <p className="mt-1 text-sm text-[#776F65]">
            Manage menu items, prices and availability
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { fetchProducts().catch(() => {}); fetchCategories().catch(() => {}) }} disabled={loading} className="rounded-lg border border-[#D3C9BB] bg-[#FFFDF9] px-4 py-2 text-sm font-bold text-[#776F65] hover:text-[#211E1A] disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh'}</button>
          <button type="button" onClick={openAddForm} className="rounded-lg bg-[#211E1A] px-4 py-2 text-sm font-bold text-white hover:bg-[#3A352E]">+ Add product</button>
        </div>
      </header>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" className="w-full max-w-sm rounded-xl border border-[#E2DBD0] bg-[#FFFDF9] px-4 py-2.5 text-sm outline-none focus:border-[#B25F6C]" />
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter products by category" className="rounded-xl border border-[#E2DBD0] bg-[#FFFDF9] px-4 py-2.5 text-sm outline-none focus:border-[#B25F6C]"><option value="all">All categories</option>{categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}</select>
        <span className="self-center text-sm text-[#776F65]">{visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}</span>
      </div>

      <section className="overflow-hidden rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-[#F1ECE4] text-[#776F65]">
              <tr>
                <th className="px-4 py-4 font-medium">Product</th>
                <th className="px-4 py-4 font-medium">Category</th>
                <th className="px-4 py-4 font-medium">Price</th>
                <th className="px-4 py-4 font-medium">Availability</th>
                <th className="px-4 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product.id} className="border-t border-[#E2DBD0]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          onError={(event) => { event.currentTarget.style.visibility = 'hidden' }}
                          className="h-11 w-11 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFE6D7] text-xl">
                          🍽️
                        </span>
                      )}

                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {getCategoryName(product.category_id)}
                  </td>

                  <td className="px-4 py-4">
                    {formatPeso(product.price)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        product.is_available
                          ? 'bg-[#E8EDE7] text-[#2F3B33]'
                          : 'bg-[#F1ECE4] text-[#948B7F]'
                      }`}
                    >
                      {product.is_available ? 'Visible' : 'Unavailable'}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={loading}
                        onClick={() => openEditForm(product)}
                        className="rounded-lg border border-[#211E1A] px-3 py-1.5 text-xs font-bold hover:bg-[#F1ECE4]"
                      >
                        Edit
                      </button>

                        <button
                          type="button"
                          disabled={loading}
                        onClick={() => handleDelete(product)}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && visibleProducts.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-[#776F65]"
                  >
                    {products.length === 0 ? 'No products found.' : 'No products match these filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <p className="border-t border-[#E2DBD0] px-4 py-3 text-sm text-[#776F65]">
            Loading products…
          </p>
        )}
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="my-auto w-full max-w-lg rounded-[1.1rem] bg-[#FFFDF9] p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Edit product' : 'Add product'}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-3 py-1 text-xl text-[#776F65] hover:bg-[#F1ECE4]"
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold">
                Product name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-xl border border-[#E2DBD0] px-4 py-3 outline-none focus:border-[#B25F6C]"
                />
              </label>

              <label className="block text-sm font-semibold">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 w-full rounded-xl border border-[#E2DBD0] px-4 py-3 outline-none focus:border-[#B25F6C]"
                />
              </label>

              <label className="block text-sm font-semibold">
                Price
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-xl border border-[#E2DBD0] px-4 py-3 outline-none focus:border-[#B25F6C]"
                />
              </label>

              <label className="block text-sm font-semibold">
                Category
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-[#E2DBD0] bg-[#FFFDF9] px-4 py-3 outline-none focus:border-[#B25F6C]"
                >
                  <option value="">Choose a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <label className="block text-sm font-semibold" htmlFor="product-image">Product image</label>
                <input id="product-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="mt-2 block w-full cursor-pointer rounded-xl border border-[#E2DBD0] bg-[#FFFDF9] text-sm file:mr-4 file:cursor-pointer file:border-0 file:bg-[#EFE6D7] file:px-4 file:py-3 file:font-bold file:text-[#211E1A] hover:file:bg-[#E5D8C4]" />
                <p className="mt-1 text-xs text-[#776F65]">JPG, PNG, or WebP · up to 5 MB · securely uploaded by the server</p>
                {(previewUrl || form.image_url) && <img src={previewUrl || form.image_url} alt="Product preview" className="mt-3 h-36 w-full rounded-xl border border-[#E2DBD0] object-cover" />}
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold">
                <input
                  name="is_available"
                  type="checkbox"
                  checked={form.is_available}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#B25F6C]"
                />
                Product is available
              </label>
            </div>

            {formError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-[#D3C9BB] px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={productsLoading || isSaving}
                className="rounded-lg bg-[#B25F6C] px-4 py-2 text-sm font-bold text-white hover:bg-[#8E4653] disabled:opacity-60"
              >
                {productsLoading || isSaving
                  ? imageFile ? 'Uploading image…' : 'Saving…'
                  : editingId
                    ? 'Save changes'
                    : 'Create product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default AdminProducts
