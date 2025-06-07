'use client'

import { InventoryComponent } from '@/blocks/inventory/Component'

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      <InventoryComponent />
    </div>
  )
} 