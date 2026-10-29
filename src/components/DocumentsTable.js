// app/components/DocumentsTable.jsx
const DocumentsTable = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dokumen`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Gagal fetch: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return (
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Judul</th>
            <th>NIS</th>
            <th>Tanggal Upload</th>
            <th>Tahun Ajaran</th>
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center' }}>
                Tidak ada data dokumen
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.nama ?? '-'}</td>
                <td>{item.judul ?? '-'}</td>
                <td>{item.nis ?? '-'}</td>
                <td>
                  {item.tanggal_upload
                    ? new Date(item.tanggal_upload).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </td>
                <td>{item.tahun_ajaran ?? '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );
  } catch (error) {
    console.error('DocumentsTable Error:', error.message);
    return <div>Error loading documents: {error.message}</div>;
  }
};

export default DocumentsTable;
