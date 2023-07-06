import { FunctionComponent } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { useRef } from 'preact/hooks'

type Props = {
  id?: string
  label?: string
  onDragSucceed?: Function
  onClick?: Function
  disabled?: boolean
}

const DragButton: FunctionComponent<Props> = ({ id, label, children, onDragSucceed, onClick, disabled }) => {
  const [isDragSucceed, setIsDragSucceed] = useState<boolean>(false)
  const [percent, setPercent] = useState<number>(0)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const button_onClick = (id) => {
    onClick && onClick(id)
  }

  let offsetX
  let button_left = 0
  let button_parent_left = 0
  const move = (e) => {
    const el = buttonRef.current
    const left = Math.min(Math.max(button_parent_left, e.pageX - offsetX), button_parent_left + 160 - 8) - button_parent_left
    el.style.left = `${left}px`

    const percent = (buttonRef.current.getBoundingClientRect().left - button_parent_left - 4) / 152
    setPercent(percent)
  }
  const add = (e) => {
    const el = buttonRef.current
    button_left = el.getBoundingClientRect().left
    button_parent_left = el.parentElement.getBoundingClientRect().left

    offsetX = e.clientX - button_left
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', remove)
  }
  const remove = () => {
    window.removeEventListener('mousemove', move)
    const el = buttonRef.current
    if (!el) return

    const percent = (el.getBoundingClientRect().left - button_parent_left - 4) / 152
    if (percent > 0.9) {
      setIsDragSucceed(true)
    } else {
      const el = buttonRef.current
      el.style.left = `1px`

      setIsDragSucceed(false)
    }
  }

  useEffect(() => {
    if (!isDragSucceed) return
    onDragSucceed && onDragSucceed()
  }, [isDragSucceed])

  return (
    <div class="drag-area" onMouseUp={remove}>
      <div class="drag-area-panel">
        <span class="drag-area-label">{percent < 0.9 ? 'KEEP SLIDING...' : 'RELEASE TO PAY!'}</span>
        <span class="drag-area-label" style={{ marginLeft: '1em' }}>
          {' '}
          ➜{' '}
        </span>
        <span class="drag-area-label">SLIDE TO PAY</span>
      </div>
      <button disabled={disabled} class="drag-button" id={id} ref={buttonRef} label={label} onMouseDown={add} onMouseUp={remove} onClick={() => button_onClick(id)}>
        {children}
      </button>
    </div>
  )
}

export default DragButton
