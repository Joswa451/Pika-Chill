import { useEffect, useMemo, useState } from 'react'
import { useCategories } from '../../features/categories/useCategories'
import { useProducts } from '../../features/products/useProducts'

function AdminCategories() {
  const {
    categories,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
    loading: categoriesLoading,
    error: categoriesError
  } = useCategories()

  const {
    products,
    fetchProducts,
    loading: productsLoading,
    error: productsError
  } = useProducts()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchCategories().catch(() => {})
    fetchProducts().catch(() => {})
  }, [fetchCategories, fetchProducts])

  function openAddForm() {
    setEditingId(null)
    setName('')
    setIsFormOpen(true)
  }

  function openEditForm(category) {
    setEditingId(category.id)
    setName(category.name)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingId(null)
    setName('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const categoryData = { name: name.trim() }

    try {
      if (editingId) {
        await editCategory(editingId, categoryData)
      } else {
        await addCategory(categoryData)
      }

      closeForm()
    } catch {
      // useCategories exposes the error through categoriesError.
    }
  }

  async function handleDelete(category) {
    const productCount = products.filter(
      (product) => String(product.category_id) === String(category.id)
    ).length
    const confirmed = window.confirm(
      productCount > 0
        ? `Delete "${category.name}"? Its ${productCount} product${productCount === 1 ? ' will' : 's will'} remain available as uncategorized.`
        : `Delete the "${category.name}" category?`
    )

    if (!confirmed) return

    try {
      await removeCategory(category.id)
    } catch {
      // useCategories exposes the error through categoriesError.
    }
  }

  const loading = categoriesLoading || productsLoading
  const error = categoriesError || productsError
  const visibleCategories = useMemo(() => categories.filter((category) =>
    category.name.toLowerCase().includes(query.trim().toLowerCase())
  ), [categories, query])

  return (
    <section>
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-[2rem]">Categories</h1>
          <p className="mt-1 text-sm text-[#776F65]">
            Group menu items for browsing
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { fetchCategories().catch(() => {}); fetchProducts().catch(() => {}) }} disabled={loading} className="rounded-lg border border-[#D3C9BB] bg-[#FFFDF9] px-4 py-2 text-sm font-bold text-[#776F65] hover:text-[#211E1A] disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh'}</button>
          <button type="button" onClick={openAddForm} className="rounded-lg bg-[#211E1A] px-4 py-2 text-sm font-bold text-white hover:bg-[#3A352E]">+ Add category</button>
        </div>
      </header>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" aria-label="Search categories" className="w-full max-w-sm rounded-xl border border-[#E2DBD0] bg-[#FFFDF9] px-4 py-2.5 text-sm outline-none focus:border-[#B25F6C]" />
        <span className="text-sm text-[#776F65]">{visibleCategories.length} {visibleCategories.length === 1 ? 'category' : 'categories'}</span>
      </div>

      <section className="overflow-hidden rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead className="bg-[#F1ECE4] text-[#776F65]">
              <tr>
                <th className="px-4 py-4 font-medium">Category</th>
                <th className="px-4 py-4 font-medium">Products</th>
                <th className="px-4 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleCategories.map((category) => {
                const productCount = products.filter(
                  (product) => String(product.category_id) === String(category.id)
                ).length

                return (
                  <tr
                    key={category.id}
                    className="border-t border-[#E2DBD0]"
                  >
                    <td className="px-4 py-4">{category.name}</td>
                    <td className="px-4 py-4">
                      {productCount}{' '}
                      {productCount === 1 ? 'product' : 'products'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(category)}
                          className="rounded-lg border border-[#211E1A] px-3 py-1.5 text-xs font-bold hover:bg-[#F1ECE4]"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {!loading && visibleCategories.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-4 py-8 text-center text-[#776F65]"
                  >
                    {categories.length === 0 ? 'No categories found.' : 'No categories match this search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <p className="border-t border-[#E2DBD0] px-4 py-3 text-sm text-[#776F65]">
            Loading categories…
          </p>
        )}
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-[1.1rem] bg-[#FFFDF9] p-6 shadow-xl"
          >
            <h2 className="mb-5 text-xl font-semibold">
              {editingId ? 'Edit category' : 'Add category'}
            </h2>

            <label className="block text-sm font-semibold">
              Category name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoFocus
                className="mt-2 w-full rounded-xl border border-[#E2DBD0] px-4 py-3 outline-none focus:border-[#B25F6C]"
                placeholder="For example, Rice meals"
              />
            </label>

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
                disabled={categoriesLoading}
                className="rounded-lg bg-[#B25F6C] px-4 py-2 text-sm font-bold text-white hover:bg-[#8E4653] disabled:opacity-60"
              >
                {categoriesLoading
                  ? 'Saving…'
                  : editingId
                    ? 'Save changes'
                    : 'Create category'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default AdminCategories
