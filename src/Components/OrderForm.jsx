import React, { useEffect, useState } from 'react';
import { ShoppingCart, Package, User, Mail, Hash, DollarSign } from 'lucide-react';
import axios from 'axios'
import { BASE_URL } from '../constant';
import { toast } from 'react-toastify';

const OrderForm = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerId: '',
    quantity: '',
    product: '',
    productCost: '',
    userEmail: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [products, setProducts] = useState(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const response = await axios.get(BASE_URL + '/api/products/');
        console.log('Products fetched:', response.data);
        setProducts(response.data);
      } catch (error) {
        console.error('Could not fetch the products', error);
        setProductsError('Failed to load products. Please try again.');
        setProducts([]); // Set empty array to prevent map errors
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'product' && products && products.length > 0) {
      // Convert value to number if it's a numeric string, otherwise keep as string
      const productId = isNaN(value) ? value : Number(value);
      const selectedProduct = products.find(p => p.id === productId);
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          productCost: selectedProduct.cost.toString()
        }));
      }
    }
  };

  const calculateTotal = () => {
    const qty = parseFloat(formData.quantity) || 0;
    const cost = parseFloat(formData.productCost) || 0;
    return (qty * cost).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Prepare the order data according to your Django model
      const orderData = {
        customer_name: formData.customerName,
        customer_id: formData.customerId,
        product: parseInt(formData.product), // Ensure it's an integer for the foreign key
        quantity: parseInt(formData.quantity),
        product_cost: parseFloat(formData.productCost),
        user_email: formData.userEmail,
        status: 'Order Placed' // Default status as per your model
      };

      console.log('Submitting order data:', orderData);

      // Make the actual API call to your Django backend
      const response = await axios.post(BASE_URL + '/api/orders/', orderData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Order submitted successfully:', response.data);
      toast.success('Order Submitted Successfully')
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setFormData({
        customerName: '',
        customerId: '',
        quantity: '',
        product: '',
        productCost: '',
        userEmail: ''
      });

    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Error Submitting Order')
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        console.error('Error response:', error.response.data);
        setSubmitStatus('error');
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        setSubmitStatus('error');
      } else {
        // Something else happened
        console.error('Error:', error.message);
        setSubmitStatus('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryFetchProducts = () => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const response = await axios.get(BASE_URL + '/api/products/');
        console.log('Products fetched:', response.data);
        setProducts(response.data);
      } catch (error) {
        console.error('Could not fetch the products', error);
        setProductsError('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-blue-600 p-2 sm:p-3 lg:p-4 rounded-full">
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-1 sm:mb-2 px-2">
            Order Management System
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg xl:text-xl px-4">
            Place your order and track its progress
          </p>
        </div>

        <div className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8 xl:p-10 border border-gray-100">
            <div className="flex items-center mb-4 sm:mb-6 lg:mb-8">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-600 mr-2 sm:mr-3" />
              <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-900">New Order</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                {/* Customer Name */}
                <div>
                  <label className="flex items-center text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1 sm:mb-2">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" />
                    Customer Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter customer name"
                  />
                </div>

                {/* Customer ID */}
                <div>
                  <label className="flex items-center text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1 sm:mb-2">
                    <Hash className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" />
                    Customer ID
                  </label>
                  <input
                    type="text"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter customer ID"
                  />
                </div>

                {/* Product Selection */}
                <div>
                  <label className="flex items-center text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1 sm:mb-2">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" />
                    Product
                  </label>
                  <select
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    required
                    disabled={productsLoading || productsError}
                    className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {productsLoading ? (
                      <option value="">Loading products...</option>
                    ) : productsError ? (
                      <option value="">Failed to load products</option>
                    ) : products && products.length > 0 ? (
                      <>
                        <option value="">Select a product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ${product.cost}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value="">No products available</option>
                    )}
                  </select>
                  
                  {/* Error message and retry button */}
                  {productsError && (
                    <div className="mt-2 flex items-center justify-between bg-red-50 border border-red-200 rounded-md p-2">
                      <span className="text-red-700 text-xs sm:text-sm">{productsError}</span>
                      <button
                        type="button"
                        onClick={retryFetchProducts}
                        className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium underline"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  
                  {/* Loading indicator */}
                  {productsLoading && (
                    <div className="mt-2 flex items-center text-gray-500 text-xs sm:text-sm">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      Loading products...
                    </div>
                  )}
                </div>

                {/* Quantity and Cost */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  <div>
                    <label className="flex items-center text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1 sm:mb-2">
                      <Hash className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" />
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1 sm:mb-2">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Product Cost (Unit)</span>
                      <span className="sm:hidden">Unit Cost</span>
                    </label>
                    <input
                      type="number"
                      name="productCost"
                      value={formData.productCost}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Product cost"
                    />
                  </div>
                </div>

                {/* Total Cost */}
                {formData.quantity && formData.productCost && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md sm:rounded-lg p-3 sm:p-4 lg:p-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                      <span className="text-blue-800 font-medium text-sm sm:text-base lg:text-lg">Total Cost:</span>
                      <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">${calculateTotal()}</span>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="flex items-center text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1 sm:mb-2">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" />
                    User Email
                  </label>
                  <input
                    type="email"
                    name="userEmail"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || productsLoading || productsError}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 lg:py-5 px-4 sm:px-6 lg:px-8 rounded-md sm:rounded-lg font-semibold text-sm sm:text-base lg:text-lg xl:text-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 border-b-2 border-white mr-2 sm:mr-3"></div>
                      <span className="hidden sm:inline">Processing Order...</span>
                      <span className="sm:hidden">Processing...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mt-4 sm:mt-6 bg-green-50 border border-green-200 rounded-md sm:rounded-lg p-3 sm:p-4">
                <div className="flex items-start sm:items-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-green-800 font-medium text-sm sm:text-base lg:text-lg">Order Placed Successfully!</h3>
                    <p className="text-green-700 text-xs sm:text-sm lg:text-base mt-1">Your order has been submitted and saved to the database.</p>
                  </div>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mt-4 sm:mt-6 bg-red-50 border border-red-200 rounded-md sm:rounded-lg p-3 sm:p-4">
                <div className="flex items-start sm:items-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-red-800 font-medium text-sm sm:text-base lg:text-lg">Order Submission Failed</h3>
                    <p className="text-red-700 text-xs sm:text-sm lg:text-base mt-1">There was an error processing your order. Please try again.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-6 sm:mt-8 lg:mt-10 text-gray-500 text-xs sm:text-sm lg:text-base">
        <p>Order Management System v1.0</p>
      </div>
    </div>
  );
};

export default OrderForm;