import css from "./NoteForm.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { createNote } from "../../services/noteService";
import * as Yup from "yup";
import type { NoteTag } from "../../types/note";

interface NoteFormProps {
    onCancel: () => void;
}

interface FormValues {
    title: string;
    content: string;
    tag: string;
}

const initialFormValues: FormValues = {
    title: "",
    content: "",
    tag: "Todo" as NoteTag,
};

const validationSchema = Yup.object({
    title: Yup.string()
        .min(3, "Enter at least three characters")
        .max(50, "The fifty character limit exceeded")
        .required("The title is required"),
    content: Yup.string()
        .max(500, "Five hundred characters are allowed only"),
    tag: Yup.string()
        .oneOf(["Work", "Personal", "Meeting", "Shopping", "Todo"], "Invalid tag")
        .required("The tag is required"),
});

export default function NoteForm({ onCancel }: NoteFormProps) {
    const queryClient = useQueryClient();

    const createNoteMutation = useMutation({
        mutationFn: (values: FormValues) => createNote(values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            onCancel();
        },
    });

    return (
        <Formik
            initialValues={initialFormValues}
            validationSchema={validationSchema}
            onSubmit={(values: FormValues, { resetForm }) => {
                createNoteMutation.mutate(values);
                resetForm();
            }}
        >
            <Form className={css.form}>
            <div className={css.formGroup}>
                <label htmlFor="title">Title</label>
                <Field id="title" type="text" name="title" className={css.input} />
                <ErrorMessage name="title" className={css.error} component="span" />
            </div>

            <div className={css.formGroup}>
                <label htmlFor="content">Content</label>
                    <Field
                    as="textarea"
                    id="content"
                    name="content"
                    rows={8}
                    className={css.textarea}
                />
                <ErrorMessage name="content" className={css.error} component="span" />
            </div>

            <div className={css.formGroup}>
                <label htmlFor="tag">Tag</label>
                <Field as="select" id="tag" name="tag" className={css.select}>
                    <option value="Todo">Todo</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Shopping">Shopping</option>
                </Field>
                <ErrorMessage name="tag" className={css.error} component="span" />
            </div>

            <div className={css.actions}>
                <button
                        type="button"
                        className={css.cancelButton}
                        onClick={onCancel}
                        disabled={createNoteMutation.isPending}
                    >
                    Cancel
                </button>
                <button
                        type="submit"
                        className={css.submitButton}
                        disabled={createNoteMutation.isPending}
                    >
                        Create note
                </button>
            </div>
            </Form>
        </Formik>
    );
}
