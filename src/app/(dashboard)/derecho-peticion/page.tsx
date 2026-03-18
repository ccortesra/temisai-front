"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
    AnexoInput,
    DerechoPeticionInput,
    GeneratedDocResponse,
    MedioRespuesta,
    TipoPeticion,
} from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Copy, Plus, Trash2 } from "lucide-react";

const TIPO_PETICION_OPTIONS: Array<{ value: TipoPeticion; label: string }> = [
    { value: "informacion", label: "Solicitud de informacion" },
    { value: "consulta", label: "Consulta" },
    { value: "queja", label: "Queja" },
    { value: "reclamo", label: "Reclamo" },
    { value: "sugerencia", label: "Sugerencia" },
];

const MEDIO_RESPUESTA_OPTIONS: Array<{ value: MedioRespuesta; label: string }> = [
    { value: "correo_electronico", label: "Correo electronico" },
    { value: "fisico", label: "Medio fisico" },
];

function ensureAtLeastOneNonEmpty(items: string[]) {
    return items.map((i) => i.trim()).filter(Boolean).length > 0;
}

export default function DerechoPeticionPage() {
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [generated, setGenerated] = useState<GeneratedDocResponse | null>(null);

    const [tipoPeticion, setTipoPeticion] = useState<TipoPeticion>("informacion");
    const [medioRespuesta, setMedioRespuesta] = useState<MedioRespuesta>("correo_electronico");
    const [ciudad, setCiudad] = useState("");
    const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
    const [asunto, setAsunto] = useState("");

    const [solicitante, setSolicitante] = useState({
        nombre_completo: "",
        tipo_documento: "",
        numero_documento: "",
        direccion_notificacion: "",
        correo_electronico: "",
        telefono: "",
    });

    const [destinatario, setDestinatario] = useState({
        entidad: "",
        nombre_funcionario: "",
        cargo_funcionario: "",
        direccion: "",
        correo: "",
    });

    const [hechos, setHechos] = useState<string[]>([""]);
    const [peticiones, setPeticiones] = useState<string[]>([""]);
    const [anexos, setAnexos] = useState<AnexoInput[]>([]);

    const generateMutation = useMutation({
        mutationFn: async (payload: DerechoPeticionInput) => {
            const res = await apiClient.post<GeneratedDocResponse>(
                "/generate/derecho-peticion",
                payload
            );
            return res.data;
        },
        onSuccess: (data) => {
            setGenerated(data);
            setError(null);
        },
        onError: (err: any) => {
            setGenerated(null);
            setError(
                err.response?.data?.detail ||
                    err.response?.data?.detail?.[0]?.msg ||
                    err.message ||
                    "No se pudo generar el derecho de peticion."
            );
        },
    });

    const updateListItem = (
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        index: number,
        value: string
    ) => {
        setter((prev) => prev.map((item, i) => (i === index ? value : item)));
    };

    const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter((prev) => [...prev, ""]);
    };

    const removeListItem = (
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        index: number
    ) => {
        setter((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (
            !solicitante.nombre_completo.trim() ||
            !solicitante.tipo_documento.trim() ||
            !solicitante.numero_documento.trim() ||
            !solicitante.direccion_notificacion.trim() ||
            !solicitante.correo_electronico.trim() ||
            !destinatario.entidad.trim() ||
            !ciudad.trim() ||
            !fecha.trim() ||
            !asunto.trim()
        ) {
            setError("Completa todos los campos obligatorios del formulario.");
            return;
        }

        if (!ensureAtLeastOneNonEmpty(hechos)) {
            setError("Debes agregar al menos un hecho.");
            return;
        }

        if (!ensureAtLeastOneNonEmpty(peticiones)) {
            setError("Debes agregar al menos una peticion.");
            return;
        }

        const payload: DerechoPeticionInput = {
            tipo_peticion: tipoPeticion,
            solicitante: {
                ...solicitante,
                telefono: solicitante.telefono.trim() || undefined,
            },
            destinatario: {
                ...destinatario,
                nombre_funcionario: destinatario.nombre_funcionario.trim() || undefined,
                cargo_funcionario: destinatario.cargo_funcionario.trim() || undefined,
                direccion: destinatario.direccion.trim() || undefined,
                correo: destinatario.correo.trim() || undefined,
            },
            ciudad: ciudad.trim(),
            fecha,
            asunto: asunto.trim(),
            hechos: hechos.map((h) => h.trim()).filter(Boolean),
            peticiones: peticiones.map((p) => p.trim()).filter(Boolean),
            anexos: anexos
                .map((a) => ({
                    nombre: a.nombre.trim(),
                    descripcion: a.descripcion?.trim() || undefined,
                }))
                .filter((a) => a.nombre),
            medio_respuesta: medioRespuesta,
        };

        generateMutation.mutate(payload);
    };

    const copyGeneratedText = async () => {
        if (!generated?.text) return;
        await navigator.clipboard.writeText(generated.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Generar Derecho de peticion
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                    Completa los campos con informacion clara y concreta. El sistema
                    generara un borrador en texto plano para que lo revises y ajustes.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                        1) Datos del solicitante
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Datos de la persona que presenta la peticion. Deben coincidir con
                        su documento e informacion de contacto.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <InputField
                            label="Nombre completo *"
                            value={solicitante.nombre_completo}
                            onChange={(v) =>
                                setSolicitante((prev) => ({ ...prev, nombre_completo: v }))
                            }
                        />
                        <InputField
                            label="Tipo de documento *"
                            value={solicitante.tipo_documento}
                            onChange={(v) =>
                                setSolicitante((prev) => ({ ...prev, tipo_documento: v }))
                            }
                            placeholder="CC, CE, TI..."
                        />
                        <InputField
                            label="Numero de documento *"
                            value={solicitante.numero_documento}
                            onChange={(v) =>
                                setSolicitante((prev) => ({ ...prev, numero_documento: v }))
                            }
                        />
                        <InputField
                            label="Correo electronico *"
                            type="email"
                            value={solicitante.correo_electronico}
                            onChange={(v) =>
                                setSolicitante((prev) => ({ ...prev, correo_electronico: v }))
                            }
                        />
                        <InputField
                            label="Direccion de notificacion *"
                            value={solicitante.direccion_notificacion}
                            onChange={(v) =>
                                setSolicitante((prev) => ({
                                    ...prev,
                                    direccion_notificacion: v,
                                }))
                            }
                            className="md:col-span-2"
                        />
                        <InputField
                            label="Telefono (opcional)"
                            value={solicitante.telefono}
                            onChange={(v) =>
                                setSolicitante((prev) => ({ ...prev, telefono: v }))
                            }
                        />
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                        2) Datos del destinatario
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Entidad o funcionario a quien diriges la solicitud.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <InputField
                            label="Entidad *"
                            value={destinatario.entidad}
                            onChange={(v) =>
                                setDestinatario((prev) => ({ ...prev, entidad: v }))
                            }
                        />
                        <InputField
                            label="Nombre del funcionario (opcional)"
                            value={destinatario.nombre_funcionario}
                            onChange={(v) =>
                                setDestinatario((prev) => ({
                                    ...prev,
                                    nombre_funcionario: v,
                                }))
                            }
                        />
                        <InputField
                            label="Cargo del funcionario (opcional)"
                            value={destinatario.cargo_funcionario}
                            onChange={(v) =>
                                setDestinatario((prev) => ({
                                    ...prev,
                                    cargo_funcionario: v,
                                }))
                            }
                        />
                        <InputField
                            label="Correo del destinatario (opcional)"
                            type="email"
                            value={destinatario.correo}
                            onChange={(v) =>
                                setDestinatario((prev) => ({ ...prev, correo: v }))
                            }
                        />
                        <InputField
                            label="Direccion del destinatario (opcional)"
                            value={destinatario.direccion}
                            onChange={(v) =>
                                setDestinatario((prev) => ({ ...prev, direccion: v }))
                            }
                            className="md:col-span-2"
                        />
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                        3) Datos de la peticion
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Define tipo, asunto y canal de respuesta para estructurar el
                        documento correctamente.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <SelectField
                            label="Tipo de peticion *"
                            value={tipoPeticion}
                            onChange={(v) => setTipoPeticion(v as TipoPeticion)}
                            options={TIPO_PETICION_OPTIONS}
                        />
                        <SelectField
                            label="Medio de respuesta *"
                            value={medioRespuesta}
                            onChange={(v) => setMedioRespuesta(v as MedioRespuesta)}
                            options={MEDIO_RESPUESTA_OPTIONS}
                        />
                        <InputField
                            label="Ciudad *"
                            value={ciudad}
                            onChange={setCiudad}
                        />
                        <InputField
                            label="Fecha *"
                            type="date"
                            value={fecha}
                            onChange={setFecha}
                        />
                        <InputField
                            label="Asunto *"
                            value={asunto}
                            onChange={setAsunto}
                            className="md:col-span-2"
                            placeholder="Ej: Solicitud de informacion sobre..."
                        />
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">4) Hechos</h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Describe los antecedentes que justifican tu solicitud.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addListItem(setHechos)}
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Agregar hecho
                        </Button>
                    </div>

                    <div className="space-y-3 mt-4">
                        {hechos.map((hecho, index) => (
                            <div key={index} className="flex gap-2">
                                <textarea
                                    value={hecho}
                                    onChange={(e) =>
                                        updateListItem(setHechos, index, e.target.value)
                                    }
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    rows={2}
                                    placeholder={`Hecho ${index + 1}`}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeListItem(setHechos, index)}
                                    title="Eliminar hecho"
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                5) Peticiones
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Indica claramente las acciones o respuestas que solicitas.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addListItem(setPeticiones)}
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Agregar peticion
                        </Button>
                    </div>

                    <div className="space-y-3 mt-4">
                        {peticiones.map((peticion, index) => (
                            <div key={index} className="flex gap-2">
                                <textarea
                                    value={peticion}
                                    onChange={(e) =>
                                        updateListItem(setPeticiones, index, e.target.value)
                                    }
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    rows={2}
                                    placeholder={`Peticion ${index + 1}`}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeListItem(setPeticiones, index)}
                                    title="Eliminar peticion"
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                6) Anexos (opcional)
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Agrega soportes que ayuden a la entidad a responder tu caso.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setAnexos((prev) => [...prev, { nombre: "", descripcion: "" }])
                            }
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Agregar anexo
                        </Button>
                    </div>

                    {anexos.length === 0 ? (
                        <p className="mt-4 text-xs text-slate-500">
                            No has agregado anexos. Puedes continuar sin esta seccion.
                        </p>
                    ) : (
                        <div className="space-y-3 mt-4">
                            {anexos.map((anexo, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-slate-200 p-3 space-y-3"
                                >
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setAnexos((prev) =>
                                                    prev.filter((_, i) => i !== index)
                                                )
                                            }
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500 mr-1" />
                                            Eliminar
                                        </Button>
                                    </div>
                                    <InputField
                                        label="Nombre del anexo *"
                                        value={anexo.nombre}
                                        onChange={(v) =>
                                            setAnexos((prev) =>
                                                prev.map((a, i) =>
                                                    i === index ? { ...a, nombre: v } : a
                                                )
                                            )
                                        }
                                    />
                                    <InputField
                                        label="Descripcion (opcional)"
                                        value={anexo.descripcion ?? ""}
                                        onChange={(v) =>
                                            setAnexos((prev) =>
                                                prev.map((a, i) =>
                                                    i === index
                                                        ? { ...a, descripcion: v }
                                                        : a
                                                )
                                            )
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <Button
                        type="submit"
                        className="bg-slate-900 text-white hover:bg-slate-800"
                        disabled={generateMutation.isPending}
                    >
                        {generateMutation.isPending
                            ? "Generando documento..."
                            : "Generar derecho de peticion"}
                    </Button>
                </div>
            </form>

            {generated && (
                <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-emerald-900">
                            <CheckCircle2 className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">
                                Documento generado correctamente
                            </h2>
                        </div>
                        <Button type="button" variant="outline" onClick={copyGeneratedText}>
                            <Copy className="h-4 w-4 mr-1.5" />
                            {copied ? "Copiado" : "Copiar texto"}
                        </Button>
                    </div>
                    <p className="text-xs text-emerald-800 mt-2">
                        ID: {generated.gen_doc_id} · Tipo: {generated.document_type}
                    </p>
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-4">
                        <pre className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-sans">
                            {generated.text}
                        </pre>
                    </div>
                </section>
            )}
        </div>
    );
}

function InputField({
    label,
    value,
    onChange,
    type = "text",
    className = "",
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    className?: string;
    placeholder?: string;
}) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
        </div>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
