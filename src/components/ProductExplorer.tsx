"use client";

import { defaultQuery, fetchProducts } from "@/lib/products";
import type { Product, ProductDraft, ProductList, SearchQuery } from "@/lib/products";
import ProductSearchForm from "./ProductSearchForm";
import ProductForm from "./ProductForm";
import { useEffect, useState } from "react";

type LoadState = "loading" | "error" | "ready";

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");
  }

  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ"
    );
    setStatus("error");
  }

  function saveProduct(draft: ProductDraft) {
    if (editingId === null) {
      setProducts([...products, { ...draft, id: Date.now() }]);
    } else {
      setProducts(
        products.map((product) =>
          product.id === editingId ? { ...product, ...draft } : product
        )
      );
    }
    setIsFormOpen(false);
    setEditingId(null);
  }

  function removeProduct(id: number) {
    setProducts(products.filter((product) => product.id !== id));
    if (editingId === id) {
      setIsFormOpen(false);
      setEditingId(null);
    }
  }

  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");

    try {
      showResult(await fetchProducts(query));
    } catch (error) {
      showError(error);
    }
  }

  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError);
  }, []);

  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFormOpen]);

  function openCreateForm() {
    setEditingId(null);
    setIsFormOpen(true);
  }

  function openEditForm(id: number) {
    setEditingId(id);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
  }

  const editing = products.find((product) => product.id === editingId) ?? null;

  return (
    <main className="page">
      <header className="page-header">
        <h1>รายการสินค้า</h1>
        <p className="page-subtitle">ค้นหา จัดการ และติดตามสต๊อกสินค้า</p>
      </header>

      <div className="toolbar">
        <ProductSearchForm onSearch={loadProducts} />

        <div className="toolbar-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => loadProducts(defaultQuery)}
            disabled={status === "loading"}
          >
            {status === "loading" ? "กำลังโหลด" : "โหลดข้อมูล"}
          </button>
          <button type="button" className="btn btn-primary" onClick={openCreateForm}>
            + เพิ่มสินค้าใหม่
          </button>
        </div>
      </div>

      <section aria-live="polite" className="results">
        {status === "loading" && <p className="state-message">กำลังโหลดข้อมูล</p>}

        {status === "error" && (
          <p className="state-message state-error" role="alert">{errorMessage}</p>
        )}

        {status === "ready" && products.length === 0 && (
          <p className="state-message">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
        )}

        {status === "ready" && products.length > 0 && (
          <div className="product-grid">
            {products.map((item) => (
              <article key={item.id} className="product-card">
                <div className="product-media">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} />
                  ) : (
                    <div className="product-media-placeholder">ไม่มีรูปภาพ</div>
                  )}
                  <span className="product-chip">{item.category}</span>
                </div>

                <div className="product-body">
                  <h2 className="product-title">{item.title}</h2>
                  <p className="product-price">฿{item.price.toLocaleString()}</p>
                  <p className="product-stock">คงเหลือ {item.stock} ชิ้น</p>
                </div>

                <div className="product-actions">
                  <button type="button" className="btn-icon" onClick={() => openEditForm(item.id)}>
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-icon-danger"
                    onClick={() => removeProduct(item.id)}
                  >
                    ลบ
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isFormOpen ? (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>
              <button type="button" className="modal-close" onClick={closeForm} aria-label="ปิด">
                ✕
              </button>
            </div>
            <ProductForm
              key={editingId ?? "new"}
              editing={editing}
              onSave={saveProduct}
              onCancel={closeForm}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}