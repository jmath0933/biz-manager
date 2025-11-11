'use client';

import React, { useState } from 'react';

const InvoiceForm = () => {
  const [form, setForm] = useState({
    date: '',
    supplier: '',
    receiver: '',
    itemname: '',
    spec: '',
    qty: '',
    unitPrice: '',
    supplyPrice: '',
    tax: '',
    totalPrice: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2>전자세금계산서 입력</h2>
      <form style={{ display: 'grid', gap: '12px' }}>
        {[
          { label: '날짜', name: 'date' },
          { label: '공급자', name: 'supplier' },
          { label: '수요자', name: 'receiver' },
          { label: '품목', name: 'itemname' },
          { label: '규격', name: 'spec' },
          { label: '수량', name: 'qty' },
          { label: '단가', name: 'unitPrice' },
          { label: '공급가액', name: 'supplyPrice' },
          { label: '세액', name: 'tax' },
          { label: '합계금액', name: 'totalPrice' },
        ].map(field => (
          <div key={field.name}>
            <label style={{ display: 'block', marginBottom: 4 }}>{field.label}</label>
            <input
              type="text"
              name={field.name}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
        ))}
      </form>
    </div>
  );
};

export default InvoiceForm;
