import css from "./App.module.css";
import SearchBox from "../SearchBox/SearchBox";
import NoteList from "../NoteList/NoteList";
import Pagination from "../Pagination/Pagination";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { fetchNotes, type FetchNotesResponse } from "../../services/noteService";

export default function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [debouncedSearch] = useDebounce(search, 1000);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const { data, isLoading } = useQuery<FetchNotesResponse>({
        queryKey: ["notes", page, debouncedSearch],
        queryFn: () => fetchNotes(
            debouncedSearch,
            page),
        placeholderData: (prev) => prev,
    });

    return (
        <div className={css.app}>
            <header className={css.toolbar}>
                <SearchBox value={search} onChange={handleSearchChange} />
                {data?.totalPages && data.totalPages > 1 && (
                    <Pagination
                        currentPage={page}
                        totalPages={data.totalPages}
                        onPageChange={setPage}
                    />
                )}
                <button className={css.button} onClick={openModal}>Create note +</button>
            </header>
            {isLoading && <strong>Loading...</strong>}
            {data && !isLoading && data.notes.length > 0 && <NoteList notes={data.notes} />}
            {isModalOpen && (
                <Modal onClose={closeModal}>
                    <NoteForm onCancel={closeModal} />
                </Modal>
            )}
        </div>
    );
}
