import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import { paymentsAPI } from '../services/api';

export default function Payment() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  
  const membershipPrices = {
    'Individual': 50,
    'Family': 120,
    'Director': 200
  };

  const amount = membershipPrices[user?.membershipTypeName] || 50;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await paymentsAPI.process({
        membershipTypeId: user.membershipTypeId,
        paymentMethod: 'CreditCard',
        transactionId: 'TXN-' + Date.now()
      });
      
      if (response.success) {
        alert('Payment processed successfully!');
      }
    } catch (err) {
      alert('Payment failed: ' + (err.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Membership Payment</h1>
        <p className="text-gray-600 text-lg">Complete your annual membership fee payment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="bg-gradient-to-br from-primary to-primary-light text-white rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
            <div className="mb-1">Membership Type: <strong>{user?.membershipTypeName}</strong></div>
            <div className="text-4xl font-bold my-4">${amount}.00</div>
            <div className="text-sm opacity-90">Annual membership fee</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder Name</label>
              <input type="text" required className="input w-full" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
              <input type="text" required className="input w-full" placeholder="1234 5678 9012 3456" maxLength="19" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry</label>
                <input type="text" required className="input w-full" placeholder="MM/YY" maxLength="5" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                <input type="text" required className="input w-full" placeholder="123" maxLength="3" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full flex items-center justify-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>{loading ? 'Processing...' : 'Complete Payment'}</span>
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">What's Included</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-2"><span className="text-green-600 font-bold">✓</span><span>Full access to all platform features</span></li>
              <li className="flex items-start space-x-2"><span className="text-green-600 font-bold">✓</span><span>Join unlimited clubs</span></li>
              <li className="flex items-start space-x-2"><span className="text-green-600 font-bold">✓</span><span>Priority event registration</span></li>
              <li className="flex items-start space-x-2"><span className="text-green-600 font-bold">✓</span><span>Member directory access</span></li>
              <li className="flex items-start space-x-2"><span className="text-green-600 font-bold">✓</span><span>Exclusive newsletters</span></li>
            </ul>
          </div>

          <div className="card bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payment</h3>
            <p className="text-gray-600 text-sm">Your payment information is encrypted and secure. We use industry-standard SSL encryption.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
