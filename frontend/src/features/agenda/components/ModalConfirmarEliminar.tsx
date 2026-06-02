type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirmar: () => void
  titulo: string
  descripcion: string
}

export function ModalConfirmarEliminar({ isOpen, onClose, onConfirmar, titulo, descripcion }: Props) {
  if (!isOpen) return null

  function handleConfirmar() {
    onConfirmar()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
      <section className="w-full max-w-md rounded-xl border border-[#2f2f2f] bg-[#050505] p-6 text-center text-white shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#f5c518] bg-[#1a1700] text-3xl">
          !
        </div>
        <h2 className="mt-5 text-2xl font-bold">{titulo}</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#a0a0a0]">{descripcion}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="rounded-lg bg-[#3f3f3f] px-4 py-3 text-white transition hover:bg-[#6b6b6b]" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="rounded-lg bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700" onClick={handleConfirmar} type="button">
            Eliminar
          </button>
        </div>
      </section>
    </div>
  )
}
