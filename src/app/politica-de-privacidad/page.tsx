import Link from "next/link";

export default function PoliticaPrivacidadPage() {
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
                        POLITICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS PERSONALES - TEMISAI
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Ultima actualizacion: 24 de marzo de 2026
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-700">
                        TemisAI, en cumplimiento de lo dispuesto en la Ley 1581 de 2012 y
                        sus normas reglamentarias, adopta la presente Politica de Privacidad
                        y Tratamiento de Datos Personales.
                    </p>
                </div>

                <div className="space-y-8 text-sm leading-relaxed text-slate-700">
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            1. IDENTIFICACION DEL RESPONSABLE Y ENCARGADO
                        </h2>
                        <p className="mt-2">
                            <strong>Responsable del tratamiento:</strong>
                            <br />
                            Los usuarios y/o firmas legales que utilizan la plataforma.
                        </p>
                        <p className="mt-2">
                            <strong>Encargado del tratamiento:</strong>
                            <br />
                            TemisAI, como proveedor tecnologico que procesa la informacion por
                            cuenta del usuario.
                        </p>
                        <p className="mt-2">
                            <strong>Contacto:</strong>
                            <br />
                            temisaicolombia@gmail.com
                            <br />
                            Colombia
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            2. DATOS PERSONALES TRATADOS
                        </h2>
                        <p className="mt-2">
                            TemisAI podra recolectar y tratar las siguientes categorias de
                            datos:
                        </p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>
                                Datos de identificacion (nombre, correo electronico,
                                telefono)
                            </li>
                            <li>Datos de acceso (credenciales, logs de acceso)</li>
                            <li>
                                Documentos cargados por el usuario (incluyendo informacion
                                contenida en ellos)
                            </li>
                            <li>
                                Datos derivados del procesamiento (texto extraido mediante
                                OCR, resultados generados por IA)
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            3. FINALIDAD DEL TRATAMIENTO
                        </h2>
                        <p className="mt-2">Los datos personales seran tratados para:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Prestar los servicios ofrecidos por TemisAI</li>
                            <li>
                                Procesar documentos mediante herramientas de inteligencia
                                artificial
                            </li>
                            <li>Extraer informacion de documentos (OCR)</li>
                            <li>Generar contenido solicitado por el usuario</li>
                            <li>Garantizar la seguridad de la plataforma</li>
                            <li>Mejorar la experiencia de uso</li>
                        </ul>
                        <p className="mt-2">
                            TemisAI <strong>no utilizara los datos para fines comerciales
                            distintos ni para entrenar modelos propios</strong>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            4. AUTORIZACION DEL TITULAR
                        </h2>
                        <p className="mt-2">El usuario declara que:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>
                                Cuenta con la autorizacion de los titulares de los datos
                                personales que carga en la plataforma
                            </li>
                            <li>
                                Tiene legitimidad para tratar dicha informacion conforme a la
                                ley
                            </li>
                        </ul>
                        <p className="mt-2">
                            TemisAI actua exclusivamente como encargado del tratamiento, por lo
                            que no verifica dicha autorizacion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            5. DERECHOS DE LOS TITULARES
                        </h2>
                        <p className="mt-2">
                            De conformidad con la normativa vigente, los titulares de los datos
                            tienen derecho a:
                        </p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Conocer, actualizar y rectificar sus datos personales</li>
                            <li>Solicitar prueba de la autorizacion otorgada</li>
                            <li>Ser informados sobre el uso de sus datos</li>
                            <li>
                                Presentar quejas ante la autoridad competente
                            </li>
                            <li>
                                Revocar la autorizacion y/o solicitar la supresion del dato
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            6. USO DE PROVEEDORES TECNOLOGICOS (TERCEROS)
                        </h2>
                        <p className="mt-2">
                            Para la prestacion del servicio, TemisAI puede utilizar servicios
                            de terceros:
                        </p>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            6.1 Procesamiento de lenguaje natural
                        </h3>
                        <p className="mt-2">Se utilizan servicios de OpenAI para:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Generacion y analisis de texto</li>
                        </ul>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            6.2 Procesamiento OCR
                        </h3>
                        <p className="mt-2">Se utilizan servicios de Landing AI para:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>
                                Extraccion de texto desde documentos e imagenes
                            </li>
                        </ul>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            6.3 Transferencia de datos
                        </h3>
                        <p className="mt-2">El usuario acepta que:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>
                                Los datos pueden ser procesados por estos proveedores
                                exclusivamente para la prestacion del servicio
                            </li>
                            <li>
                                TemisAI implementa medidas para limitar la exposicion de la
                                informacion
                            </li>
                            <li>
                                Dichos proveedores cuentan con estandares de seguridad
                                adecuados
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            7. SEGURIDAD DE LA INFORMACION
                        </h2>
                        <p className="mt-2">
                            TemisAI implementa medidas tecnicas, humanas y administrativas
                            razonables para proteger los datos personales, incluyendo:
                        </p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Control de acceso autenticado</li>
                            <li>Aislamiento de informacion por usuario/organizacion</li>
                            <li>Almacenamiento seguro de documentos</li>
                            <li>Uso de cifrado en transito (HTTPS)</li>
                        </ul>
                        <p className="mt-2">
                            No obstante, el usuario reconoce que ningun sistema es
                            completamente invulnerable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            8. CONSERVACION DE LA INFORMACION
                        </h2>
                        <p className="mt-2">
                            Los datos seran almacenados durante el tiempo necesario para:
                        </p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Cumplir con la finalidad del servicio</li>
                            <li>Dar cumplimiento a obligaciones legales</li>
                            <li>Resolver posibles controversias</li>
                        </ul>
                        <p className="mt-2">
                            El usuario podra solicitar la eliminacion de su informacion en
                            cualquier momento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            9. TRANSFERENCIA Y TRANSMISION INTERNACIONAL
                        </h2>
                        <p className="mt-2">
                            Dado el uso de servicios tecnologicos externos, los datos podran
                            ser transferidos o transmitidos a servidores ubicados fuera de
                            Colombia, cumpliendo con estandares adecuados de proteccion de
                            datos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            10. PROCEDIMIENTO PARA EJERCER DERECHOS
                        </h2>
                        <p className="mt-2">
                            Los titulares podran ejercer sus derechos enviando una solicitud a:
                        </p>
                        <p className="mt-2">temisaicolombia@gmail.com</p>
                        <p className="mt-2">La solicitud debera incluir:</p>
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                            <li>Nombre completo</li>
                            <li>Identificacion</li>
                            <li>Descripcion de la solicitud</li>
                        </ul>
                        <p className="mt-2">
                            TemisAI respondera en los terminos establecidos por la ley.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">
                            11. MODIFICACIONES A LA POLITICA
                        </h2>
                        <p className="mt-2">
                            TemisAI se reserva el derecho de modificar esta politica en
                            cualquier momento. Las modificaciones seran publicadas en la
                            plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">12. VIGENCIA</h2>
                        <p className="mt-2">
                            La presente politica rige a partir de su publicacion.
                        </p>
                    </section>
                </div>

                <p className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    Al utilizar TemisAI, usted declara haber leido y aceptado esta Politica
                    de Privacidad y Tratamiento de Datos Personales.
                </p>
            </div>
        </main>
    );
}
