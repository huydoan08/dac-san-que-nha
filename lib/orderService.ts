import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderData {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  orderDate?: string;
  orderId?: string;
}

export const createOrder = async (orderData: Omit<OrderData, 'orderDate' | 'orderId'>) => {
  try {
    console.log('Starting createOrder in orderService');
    const ordersRef = collection(db, 'orders');
    console.log('Collection reference created');
    
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: serverTimestamp(),
    });
    console.log('Document added with ID:', docRef.id);
    
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
}; 