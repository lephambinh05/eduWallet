import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AdminService } from "../services/adminService";
import toast from "react-hot-toast";

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
`;

const Card = styled.div`
  background: #0f1724;
  color: #fff;
  padding: 1.5rem;
  border-radius: 12px;
`;

const Row = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Label = styled.label`
  min-width: 130px;
  color: rgba(255, 255, 255, 0.85);
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  min-width: 260px;
`;

const Button = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  color: white;
  border: none;
  cursor: pointer;
`;

const AdminSettings = () => {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [eduPrice, setEduPrice] = useState("");
  const [minConvertPZO, setMinConvertPZO] = useState("");
  const [maxConvertPZO, setMaxConvertPZO] = useState("");
  // loading kept for potential UI enhancements
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await AdminService.getAdminWallet();
        if (resp && resp.success && resp.data) {
          // Support both shapes: { data: { wallet: {...} } } and { data: { address, eduPrice... } }
          const d = resp.data.wallet || resp.data;
          setAddress(d.address || "");
          setChainId(d.chainId || "");
          setNetworkName(d.networkName || "");
          setEduPrice(d.eduPrice || "");
          setMinConvertPZO(d.minConvertPZO || "");
          setMaxConvertPZO(d.maxConvertPZO || "");
        }
      } catch (e) {
        // If not configured, 404 expected - silently ignore
        console.warn("Admin wallet not configured or failed to load", e);
      } finally {
      }
    };
    load();
  }, []);

  const validateAddress = (a) => /^0x[a-fA-F0-9]{40}$/.test(a);

  const handleSave = async () => {
    if (!address || !validateAddress(address)) {
      toast.error(
        "Địa chỉ ví không hợp lệ. Vui lòng nhập địa chỉ bắt đầu bằng 0x và 40 ký tự hex."
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        address,
        chainId: chainId || null,
        networkName: networkName || null,
        eduPrice: eduPrice ? String(eduPrice) : null,
        minConvertPZO: minConvertPZO ? String(minConvertPZO) : null,
        maxConvertPZO: maxConvertPZO ? String(maxConvertPZO) : null,
      };
      const resp = await AdminService.upsertAdminWallet(payload);
      if (resp && resp.success) {
        toast.success("Lưu địa chỉ ví admin thành công");
      } else {
        toast.error("Lỗi khi lưu địa chỉ ví");
      }
    } catch (e) {
      console.error("Failed to save admin wallet", e);
      toast.error(
        "Lỗi khi lưu địa chỉ ví: " + (e?.response?.data?.message || e.message)
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <h2>Settings / Kết nối (Admin)</h2>
      <Card>
        <Row>
          <Label>Admin wallet address</Label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
          />
        </Row>

        <Row>
          <Label>Chain ID</Label>
          <Input
            value={chainId}
            onChange={(e) => setChainId(e.target.value)}
            placeholder="5080"
          />
        </Row>

        <Row>
          <Label>Network name</Label>
          <Input
            value={networkName}
            onChange={(e) => setNetworkName(e.target.value)}
            placeholder="pioneZero"
          />
        </Row>

        <Row>
          <Label>Giá 1 EDU (PZO)</Label>
          <Input
            value={eduPrice}
            onChange={(e) => setEduPrice(e.target.value)}
            placeholder="Ví dụ: 0.01"
          />
        </Row>

        <Row>
          <Label>Min convert (PZO)</Label>
          <Input
            value={minConvertPZO}
            onChange={(e) => setMinConvertPZO(e.target.value)}
            placeholder="Ví dụ: 0.1"
          />
        </Row>

        <Row>
          <Label>Max convert (PZO)</Label>
          <Input
            value={maxConvertPZO}
            onChange={(e) => setMaxConvertPZO(e.target.value)}
            placeholder="Để trống = không giới hạn"
          />
        </Row>

        <Row>
          <div style={{ marginLeft: 130 }}>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu cấu hình ví admin"}
            </Button>
          </div>
        </Row>

        <div style={{ marginTop: 12, color: "rgba(255,255,255,0.7)" }}>
          Lưu ý: địa chỉ ví được dùng làm ví nhận PZO khi người dùng nạp point;
          không có fallback — nếu chưa cấu hình, người dùng không thể nạp.
        </div>
      </Card>
    </Container>
  );
};

export default AdminSettings;
