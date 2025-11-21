import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function OrderSuccessPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="text-center py-20 min-h-screen flex flex-col justify-center items-center"
    >
      <h1 className="text-5xl font-bold text-green-600 mb-4">🎉 Order Confirmed!</h1>
      <p className="text-lg mb-6">Your delicious food is being prepared and will be delivered shortly.</p>
      <Link to="/" className="btn-primary">
        Go Home
      </Link>
    </motion.div>
  );
}
