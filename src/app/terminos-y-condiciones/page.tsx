import Link from "next/link";

export default function TerminosYCondicionesPage() {
    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-6">
            <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm">
                <div className="mb-8">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-slate-500 hover:text-slate-700"
                    >
                        Volver a inicio de sesion
                    </Link>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                        TERMINOS Y CONDICIONES DE USO - TEMISAI
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Ultima actualizacion: 24 de marzo de 2026
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-700">
                        Bienvenido a TemisAI. Al acceder y utilizar esta plataforma, usted
                        acepta los presentes Terminos y Condiciones, asi como nuestra Politica
                        de Tratamiento de Datos Personales. Si no esta de acuerdo con estos
                        terminos, por favor abstengase de utilizar el servicio.
                    </p>
                </div>

                <div className="space-y-8 text-sm leading-relaxed text-slate-700">
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            1. IDENTIFICACION DEL RESPONSABLE
                        </h2>
                        <p className="mt-2">
                            TemisAI es una plataforma tecnologica desarrollada para optimizar
                            procesos legales mediante herramientas de inteligencia artificial.
                        </p>
                        <p className="mt-2">
                            Para efectos de la normativa de proteccion de datos:
                        </p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>
                                <strong>Usuario / Firma legal:</strong> Responsable del
                                tratamiento de datos
                            </li>
                            <li>
                                <strong>TemisAI:</strong> Encargado del tratamiento de datos
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            2. OBJETO DEL SERVICIO
                        </h2>
                        <p className="mt-2">TemisAI ofrece herramientas para:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Generacion asistida de documentos legales</li>
                            <li>Procesamiento de texto mediante inteligencia artificial</li>
                            <li>Digitalizacion de documentos mediante OCR</li>
                            <li>Organizacion y consulta de informacion legal</li>
                        </ul>
                        <p className="mt-2">
                            El servicio esta dirigido exclusivamente a profesionales del
                            derecho y firmas legales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            3. TRATAMIENTO DE DATOS PERSONALES (HABEAS DATA)
                        </h2>
                        <p className="mt-2">
                            TemisAI cumple con lo dispuesto en la normativa colombiana de
                            proteccion de datos personales (Ley 1581 de 2012 y normas
                            complementarias).
                        </p>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            3.1 Tipo de datos tratados
                        </h3>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Documentos legales cargados por el usuario</li>
                            <li>Informacion contenida en archivos (PDF, imagenes, texto)</li>
                            <li>Datos de usuarios (nombre, correo, etc.)</li>
                        </ul>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            3.2 Finalidad del tratamiento
                        </h3>
                        <p className="mt-2">
                            Los datos seran utilizados exclusivamente para:
                        </p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Procesar documentos dentro de la plataforma</li>
                            <li>Generar resultados solicitados por el usuario</li>
                            <li>Mejorar la funcionalidad del servicio</li>
                        </ul>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            3.3 Responsabilidad del usuario
                        </h3>
                        <p className="mt-2">El usuario garantiza que:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Cuenta con autorizacion para tratar los datos cargados</li>
                            <li>
                                Cumple con la normativa de proteccion de datos aplicable
                            </li>
                            <li>
                                No cargara informacion ilegal o sin consentimiento
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            4. USO DE TECNOLOGIAS DE TERCEROS
                        </h2>
                        <p className="mt-2">
                            Para la prestacion del servicio, TemisAI utiliza proveedores
                            tecnologicos externos:
                        </p>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            4.1 Procesamiento de lenguaje (IA)
                        </h3>
                        <p className="mt-2">Se utiliza tecnologia de OpenAI para:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Generacion de texto</li>
                            <li>Analisis de contenido</li>
                        </ul>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            4.2 Procesamiento OCR
                        </h3>
                        <p className="mt-2">Se utiliza el servicio ADE de Landing AI para:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Extraccion de texto desde documentos e imagenes</li>
                        </ul>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            4.3 Consideraciones
                        </h3>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>
                                La informacion puede ser procesada por estos proveedores
                                exclusivamente para la prestacion del servicio
                            </li>
                            <li>
                                TemisAI no utiliza la informacion de los usuarios para entrenar
                                modelos propios
                            </li>
                            <li>
                                Se implementan medidas para minimizar la exposicion de datos
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            5. CONFIDENCIALIDAD
                        </h2>
                        <p className="mt-2">TemisAI se compromete a:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>No divulgar informacion cargada por los usuarios</li>
                            <li>No acceder a documentos sin autorizacion</li>
                            <li>
                                Implementar medidas tecnicas y organizativas para proteger la
                                informacion
                            </li>
                        </ul>
                        <p className="mt-2">
                            No obstante, el usuario reconoce que ningun sistema es completamente
                            invulnerable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            6. SEGURIDAD DE LA INFORMACION
                        </h2>
                        <p className="mt-2">
                            TemisAI implementa medidas de seguridad que incluyen:
                        </p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Acceso restringido mediante autenticacion</li>
                            <li>Aislamiento de datos por organizacion</li>
                            <li>Almacenamiento seguro de documentos</li>
                            <li>Uso de conexiones cifradas (HTTPS)</li>
                        </ul>
                        <p className="mt-2">El usuario es responsable de:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Mantener la confidencialidad de sus credenciales</li>
                            <li>Notificar accesos no autorizados</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            7. DISPONIBILIDAD DEL SERVICIO
                        </h2>
                        <p className="mt-2">TemisAI podra:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>
                                Modificar, suspender o discontinuar el servicio en cualquier
                                momento
                            </li>
                            <li>Realizar actualizaciones sin previo aviso</li>
                        </ul>
                        <p className="mt-2">No se garantiza disponibilidad ininterrumpida.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            8. LIMITACION DE RESPONSABILIDAD
                        </h2>
                        <p className="mt-2">TemisAI no sera responsable por:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>
                                Uso indebido de la plataforma por parte del usuario
                            </li>
                            <li>
                                Decisiones legales tomadas con base en resultados generados por
                                la IA
                            </li>
                            <li>
                                Perdida de informacion derivada de fallas externas o uso
                                incorrecto
                            </li>
                        </ul>
                        <p className="mt-2">
                            El usuario reconoce que la plataforma es una herramienta de apoyo y
                            no reemplaza el criterio profesional.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            9. PROPIEDAD DE LA INFORMACION
                        </h2>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Los documentos cargados son propiedad del usuario</li>
                            <li>TemisAI no adquiere derechos sobre el contenido</li>
                            <li>
                                El usuario conserva plena titularidad sobre su informacion
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            10. TERMINACION
                        </h2>
                        <p className="mt-2">
                            TemisAI podra suspender o cancelar el acceso si:
                        </p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Se detecta uso indebido</li>
                            <li>Se incumplen estos terminos</li>
                            <li>Se presentan riesgos de seguridad</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            11. MODIFICACIONES
                        </h2>
                        <p className="mt-2">
                            TemisAI podra actualizar estos terminos en cualquier momento. El
                            uso continuo de la plataforma implica aceptacion de los cambios.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            12. LEGISLACION APLICABLE
                        </h2>
                        <p className="mt-2">
                            Estos terminos se rigen por las leyes de la Republica de Colombia.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">13. CONTACTO</h2>
                        <p className="mt-2">
                            Para consultas relacionadas con estos terminos o el tratamiento de
                            datos, puede contactarnos en:
                        </p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>temisaicolombia@gmail.com</li>
                            <li>Colombia</li>
                        </ul>
                    </section>
                </div>

                <p className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    Al utilizar TemisAI, usted declara haber leido, entendido y aceptado
                    estos Terminos y Condiciones.
                </p>
            </div>
        </main>
    );
}
