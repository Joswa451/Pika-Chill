const supabase = require('../../config/supabase')
const { uploadProductImage, removeProductImage } = require('./productImages.service')

function getStockQuantity(inventory) {
  const record = Array.isArray(inventory) ? inventory[0] : inventory
  const quantity = Number(record?.stock_quantity)
  return Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0
}

async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, inventory(stock_quantity)')

  if (error) throw error

  return (data || []).map(({ inventory, ...product }) => ({
    ...product,
    stock_quantity: getStockQuantity(inventory)
  }))
}

async function createProduct(product, imageFile) {
  const uploadedImage = await uploadProductImage(imageFile)
  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, image_url: uploadedImage?.url || null })
    .select()
    .single()

  if (error) {
    if (uploadedImage) await removeProductImage(uploadedImage.url)
    throw error
  }

  return data
}

async function updateProduct(id, product, imageFile) {
  const { data: existingProduct, error: findError } = await supabase
    .from('products')
    .select('id, image_url')
    .eq('id', id)
    .single()

  if (findError) {
    if (findError.code === 'PGRST116') {
      const notFound = new Error('Product not found.')
      notFound.statusCode = 404
      throw notFound
    }
    throw findError
  }

  const uploadedImage = await uploadProductImage(imageFile)
  const updates = { ...product }
  if (uploadedImage) updates.image_url = uploadedImage.url

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (uploadedImage) await removeProductImage(uploadedImage.url)
    throw error
  }

  if (uploadedImage && existingProduct.image_url) {
    await removeProductImage(existingProduct.image_url)
  }

  return data
}

async function deleteProduct(id) {
  const { data: existingProduct, error: findError } = await supabase
    .from('products')
    .select('id, image_url')
    .eq('id', id)
    .single()

  if (findError) {
    if (findError.code === 'PGRST116') {
      const notFound = new Error('Product not found.')
      notFound.statusCode = 404
      throw notFound
    }
    throw findError
  }

  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  await removeProductImage(existingProduct.image_url)
  return data
}

module.exports = { getProducts, createProduct, updateProduct, deleteProduct }
