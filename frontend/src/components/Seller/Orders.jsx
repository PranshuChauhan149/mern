import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Orders = () => {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/order/seller");

      if (data.success) {
        setOrders(data.data); // ✅ FIXED HERE
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium">Orders List</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          orders.map((order, index) => (
            <div
              key={index}
              className="flex flex-col md:grid md:grid-cols-4 gap-5 p-5 max-w-4xl rounded-md border border-gray-300"
            >
              {/* Products */}
              <div className="flex flex-col gap-2">
                {order.items.map((item, idx) => (
                  <p key={idx} className="font-medium">
                    {item.product.name}{" "}
                    <span className="text-primary">x {item.quantity}</span>
                  </p>
                ))}
              </div>

              {/* Address */}
              <div className="text-sm md:text-base text-black/60">
                <p className="text-black/80 font-medium">
                  {order.address.firstName} {order.address.lastName}
                </p>
                <p>{order.address.street}, {order.address.city}</p>
                <p>{order.address.state}, {order.address.zipcode}, {order.address.country}</p>
                <p>📞 {order.address.phone}</p>
              </div>

              {/* Total Amount */}
              <p className="font-medium text-lg my-auto">
                {currency}
                {order.amount}
              </p>

              {/* Payment Info */}
              <div className="flex flex-col text-sm md:text-base text-black/60">
                <p>Method: {order.paymentType}</p>
                <p>
                  Date:{" "}
                  {new Date(order.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p>
                  Payment:{" "}
                  <span className={order.isPaid ? "text-green-600" : "text-red-600"}>
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
