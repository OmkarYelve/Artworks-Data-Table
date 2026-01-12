import { OverlayPanel } from "primereact/overlaypanel";
import 'primeflex/primeflex.css';
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useRef } from "react";
import { DataTable, type DataTablePageEvent} from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useState } from "react";
import type { Artwork } from "../types/Artwork";
import { fetchArtworks } from "../api/artworks";

const ArtworkTable = () => {

  const overlayRef = useRef<OverlayPanel>(null);
  const [targetSelectCount, setTargetSelectCount] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set());

  const selectedRows = artworks.filter(
    (art) => selectedIds.has(art.id) && !deselectedIds.has(art.id)
  );

  const onSelectionChange = (e: any) => {
    const value = e.value as Artwork[]

    const newSelectedIds = new Set(selectedIds);
    const newDeselectedIds = new Set(deselectedIds);

    const currentPageIds = artworks.map((a) => a.id);
    const selectedOnPageIds = value.map((a) => a.id);

    selectedOnPageIds.forEach((id) => {
      newSelectedIds.add(id);
      newDeselectedIds.delete(id);
    });

    currentPageIds.forEach((id) => {
      if (!selectedOnPageIds.includes(id) && newSelectedIds.has(id)) {
          newSelectedIds.delete(id);
          newDeselectedIds.add(id);
      }
    });

    setSelectedIds(newSelectedIds);
    setDeselectedIds(newDeselectedIds);
  };



  useEffect(() => {
    if (targetSelectCount === null) return;

    const newSelectedIds = new Set(selectedIds);
    const newDeselectedIds = new Set(deselectedIds);

    for (const art of artworks) {
      if (newSelectedIds.size >= targetSelectCount) break;

      if (!newSelectedIds.has(art.id)) {
        newSelectedIds.add(art.id);
        newDeselectedIds.delete(art.id);
      }
    }
    setSelectedIds(newSelectedIds);
    setDeselectedIds(newDeselectedIds);
  }, [artworks, targetSelectCount]);

  useEffect(()=>{
    const loadData = async ()=>{
        setLoading(true)
          try {
        const response = await fetchArtworks(currentPage, rowsPerPage);
        setArtworks(response.data);
        setTotalRecords(response.pagination.total);
      } catch (error) {
        console.log("Error finding artwork", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  },[currentPage, rowsPerPage])

  const onPageChange = (event: DataTablePageEvent) => {
    const page = event.page ?? 0;
    setCurrentPage(page  + 1);
    setRowsPerPage(event.rows  ?? rowsPerPage);
  };

  return (
    <div>
      <Button
        label="Custom Select Rows"
        onClick={(e) => overlayRef.current?.toggle(e)}
        className="mb-3"
      />
      <OverlayPanel ref={overlayRef}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <InputText
            placeholder="Enter number of rows"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button
            label="Apply"
            disabled={!inputValue}
            onClick={() => {
              const count = parseInt(inputValue, 10);
              if (!isNaN(count) && count > 0) {
                setTargetSelectCount(count);
              }
              setInputValue("");
              overlayRef.current?.hide();
            }}
          />
        </div>
      </OverlayPanel>

      <DataTable
        value={artworks}
        lazy
        paginator
        rows={rowsPerPage}
        totalRecords={totalRecords}
        loading={loading}
        onPage={onPageChange as any}
        first={(currentPage - 1) * rowsPerPage}
        selection={selectedRows}
        onSelectionChange={onSelectionChange as any}
        dataKey="id"
        tableStyle={{ minWidth: "60rem" }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
};

export default ArtworkTable;
