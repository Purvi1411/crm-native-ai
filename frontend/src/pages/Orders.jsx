import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, Filter } from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // In production, this hits your new backend route
                // const res = await axios.get('http://localhost:5000/api/orders');
                // setOrders(res.data);
                
                // Mock data for immediate visual feedback
                setOrders([
                    { _id: 'ORD-892', customer: 'Rahul Sharma', totalAmount: 1250, status: 'delivered', date: 'Just now' },
                    { _id: 'ORD-891', customer: 'Priya Patel', totalAmount: 450, status: 'processing', date: '2 hrs ago' },
                    { _id: 'ORD-890', customer: 'Amit Kumar', totalAmount: 3200, status: 'shipped', date: '5 hrs ago' }
                ]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="flex-1 p-10 bg-gray-50 h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <Package className="text-blue-600" /> Order Management
                    </h2>
                    <p className="text-gray-500">Track and analyze customer purchases.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <Filter size={16} /> Filter
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Search orders..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-semibold">Order ID</th>
                            <th className="p-4 font-semibold">Customer</th>
                            <th className="p-4 font-semibold">Amount</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-mono text-sm text-blue-600">{order._id}</td>
                                <td className="p-4 text-sm font-medium text-gray-800">{order.customer}</td>
                                <td className="p-4 text-sm text-gray-600">₹{order.totalAmount}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500">{order.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;
