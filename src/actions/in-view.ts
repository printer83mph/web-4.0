export default function inView(node: HTMLElement) {
  let observer: IntersectionObserver

  const setObserver = () => {
    if (observer) observer.disconnect()
    observer = new IntersectionObserver((e) => {
      node.dispatchEvent(
        new CustomEvent<boolean>('in-view', { detail: e[0].isIntersecting })
      )
    })
    observer.observe(node)
  }

  setObserver()

  return {
    update() {
      setObserver()
    },
    destroy() {
      if (observer) observer.disconnect()
    },
  }
}
