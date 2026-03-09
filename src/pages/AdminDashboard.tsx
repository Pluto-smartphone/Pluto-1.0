import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  condition: string;
  description: string | null;
  image_url: string | null;
  status: string | null;
  created_at: string | null;
}

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    brand: "",
    condition: "new",
    description: "",
    image_url: "",
    status: "available"
  });

  // ดึงข้อมูลสินค้าจาก Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('ไม่สามารถดึงข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  // เพิ่มสินค้าใหม่
  const handleAddProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...newProduct,
          seller_id: 'admin-user', // ควรใช้ user ID จริงๆ
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      toast.success('เพิ่มสินค้าสำเร็จ');
      setNewProduct({
        name: "",
        price: 0,
        brand: "",
        condition: "new",
        description: "",
        image_url: "",
        status: "available"
      });
      fetchProducts(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('ไม่สามารถเพิ่มสินค้าได้');
    }
  };

  // ลบสินค้า
  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('ลบสินค้าสำเร็จ');
      fetchProducts(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('ไม่สามารถลบสินค้าได้');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">กำลังโหลด...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* ฟอร์มเพิ่มสินค้า */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>เพิ่มสินค้าใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="ชื่อสินค้า"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
            <Input
              type="number"
              placeholder="ราคา"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
            />
            <Input
              placeholder="ยี่ห้อ"
              value={newProduct.brand}
              onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
            />
            <select
              className="border rounded px-3 py-2"
              value={newProduct.condition}
              onChange={(e) => setNewProduct({...newProduct, condition: e.target.value})}
            >
              <option value="new">ใหม่</option>
              <option value="used">มือสอง</option>
              <option value="refurbished"> refurbished</option>
            </select>
            <Input
              placeholder="รูปภาพ URL"
              value={newProduct.image_url}
              onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
            />
            <select
              className="border rounded px-3 py-2"
              value={newProduct.status}
              onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
            >
              <option value="available">พร้อมขาย</option>
              <option value="sold">ขายแล้ว</option>
              <option value="reserved">จองแล้ว</option>
            </select>
          </div>
          <textarea
            className="w-full border rounded px-3 py-2 mt-4"
            rows={3}
            placeholder="รายละเอียดสินค้า"
            value={newProduct.description}
            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
          />
          <Button onClick={handleAddProduct} className="mt-4">
            เพิ่มสินค้า
          </Button>
        </CardContent>
      </Card>

      {/* รายการสินค้า */}
      <Card>
        <CardHeader>
          <CardTitle>รายการสินค้า ({products.length} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-gray-600">฿{product.price.toLocaleString()} - {product.brand}</p>
                  <p className="text-sm text-gray-500">{product.condition} | {product.status}</p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  ลบ
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
