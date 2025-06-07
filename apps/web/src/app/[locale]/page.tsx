import Link from 'next/link'

interface PageProps {
  params: {
    locale: string;
  };
}

export default function Page({ params: { locale } }: PageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">MechBuild Core</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href={`/${locale}/protected/boq`} className="p-4 border rounded hover:bg-gray-50">
          <h2 className="text-lg font-semibold">BOQ</h2>
          <p className="text-gray-600">Bill of Quantities Management</p>
        </Link>
        <Link href={`/${locale}/protected/hvac`} className="p-4 border rounded hover:bg-gray-50">
          <h2 className="text-lg font-semibold">HVAC</h2>
          <p className="text-gray-600">Heating, Ventilation and Air Conditioning</p>
        </Link>
        <Link href={`/${locale}/protected/sprinkler`} className="p-4 border rounded hover:bg-gray-50">
          <h2 className="text-lg font-semibold">Sprinkler</h2>
          <p className="text-gray-600">Fire Protection Systems</p>
        </Link>
        <Link href={`/${locale}/protected/maintenance`} className="p-4 border rounded hover:bg-gray-50">
          <h2 className="text-lg font-semibold">Maintenance</h2>
          <p className="text-gray-600">Equipment and System Maintenance</p>
        </Link>
        <Link href={`/${locale}/protected/inventory`} className="p-4 border rounded hover:bg-gray-50">
          <h2 className="text-lg font-semibold">Inventory</h2>
          <p className="text-gray-600">Stock and Material Management</p>
        </Link>
        <Link href={`/${locale}/protected/reporting`} className="p-4 border rounded hover:bg-gray-50">
          <h2 className="text-lg font-semibold">Reporting</h2>
          <p className="text-gray-600">Analytics and Reports</p>
        </Link>
      </div>
    </div>
  )
}
