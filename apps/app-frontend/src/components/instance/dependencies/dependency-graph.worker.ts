type WorkerNode = {
	id: string
	x: number
	y: number
	vx: number
	vy: number
	depth: number
	pinned: boolean
}

type WorkerEdge = { source: string; target: string }

type StartMessage = {
	type: 'start'
	nodes: WorkerNode[]
	edges: WorkerEdge[]
	width: number
	height: number
}

type PinMessage = { type: 'pin'; id: string; x: number; y: number }
type StopMessage = { type: 'stop' }

let nodes = new Map<string, WorkerNode>()
let edges: WorkerEdge[] = []
let width = 640
let height = 360
let running = false
let timer: ReturnType<typeof setTimeout> | undefined

function clamp(value: number, lower: number, upper: number) {
	return Math.min(Math.max(value, lower), upper)
}

function tick() {
	if (!running) return
	const values = [...nodes.values()]
	const forces = new Map(values.map((node) => [node.id, { x: 0, y: 0 }]))

	for (let index = 0; index < values.length; index += 1) {
		const node = values[index]
		const force = forces.get(node.id)!
		for (let otherIndex = index + 1; otherIndex < values.length; otherIndex += 1) {
			const other = values[otherIndex]
			const dx = node.x - other.x
			const dy = node.y - other.y
			const distanceSquared = dx * dx + dy * dy + 1
			if (distanceSquared > 90000) continue
			const strength = 4200 / distanceSquared
			const distance = Math.sqrt(distanceSquared)
			const fx = (dx / distance) * strength
			const fy = (dy / distance) * strength
			force.x += fx
			force.y += fy
			const otherForce = forces.get(other.id)!
			otherForce.x -= fx
			otherForce.y -= fy
		}
	}

	for (const edge of edges) {
		const source = nodes.get(edge.source)
		const target = nodes.get(edge.target)
		if (!source || !target) continue
		const dx = target.x - source.x
		const dy = target.y - source.y
		const distance = Math.max(1, Math.hypot(dx, dy))
		const desired = 260
		const strength = (distance - desired) * 0.004
		const fx = (dx / distance) * strength
		const fy = (dy / distance) * strength
		forces.get(source.id)!.x += fx
		forces.get(source.id)!.y += fy
		forces.get(target.id)!.x -= fx
		forces.get(target.id)!.y -= fy
	}

	for (const node of values) {
		const force = forces.get(node.id)!
		const targetX = 70 + node.depth * 290
		force.x += (targetX - node.x) * 0.0025
		force.y += (height / 2 - node.y) * 0.00035
		if (node.pinned) {
			node.vx = 0
			node.vy = 0
			continue
		}
		node.vx = (node.vx + force.x) * 0.86
		node.vy = (node.vy + force.y) * 0.86
		node.x = clamp(node.x + node.vx, 8, Math.max(8, width - 236))
		node.y = clamp(node.y + node.vy, 8, Math.max(8, height - 84))
	}

	postMessage({
		type: 'positions',
		positions: values.map((node) => ({ id: node.id, x: node.x, y: node.y })),
	})
	timer = setTimeout(tick, 32)
}

self.onmessage = (event: MessageEvent<StartMessage | PinMessage | StopMessage>) => {
	const message = event.data
	if (message.type === 'stop') {
		running = false
		if (timer) clearTimeout(timer)
		timer = undefined
		return
	}
	if (message.type === 'pin') {
		const node = nodes.get(message.id)
		if (node) {
			node.x = message.x
			node.y = message.y
			node.pinned = true
		}
		return
	}

	if (timer) clearTimeout(timer)
	nodes = new Map(message.nodes.map((node) => [node.id, { ...node }]))
	edges = message.edges
	width = message.width
	height = message.height
	running = true
	tick()
}

export {}
