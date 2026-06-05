import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import * as THREE from 'three'

// Interactive WebGL 3D Canvas rendering a surgical/molecular structure
function Medical3DCanvas() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    let width = container.clientWidth
    let height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.z = 10

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Main Group for DNA Helix
    const dnaGroup = new THREE.Group()
    scene.add(dnaGroup)

    // Build DNA Double Helix
    const numPoints = 24
    const radius = 1.8
    const helixHeight = 6
    const turns = 1.2

    // Spheres
    const nodeGeom = new THREE.SphereGeometry(0.12, 16, 16)
    const highlightNodeGeom = new THREE.SphereGeometry(0.15, 16, 16)

    // Colors
    const primaryBlue = 0x001A70  // Brand deep blue
    const vibrantRed = 0xE90F06   // Brand vibrant red
    const accentPurple = 0x823CD7 // Brand violet

    const blueMaterial = new THREE.MeshPhongMaterial({
      color: primaryBlue,
      specular: 0xffffff,
      shininess: 90,
    })

    const redMaterial = new THREE.MeshPhongMaterial({
      color: vibrantRed,
      specular: 0xffffff,
      shininess: 120,
      emissive: 0x330000,
    })

    const purpleMaterial = new THREE.MeshPhongMaterial({
      color: accentPurple,
      specular: 0xffffff,
      shininess: 100,
    })

    const lineMaterial = new THREE.LineBasicMaterial({
      color: primaryBlue,
      transparent: true,
      opacity: 0.18,
    })

    const spheresStrand1 = []
    const spheresStrand2 = []

    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1)
      const angle = t * Math.PI * 2 * turns
      const y = (t - 0.5) * helixHeight

      // Strand 1 Position
      const x1 = Math.cos(angle) * radius
      const z1 = Math.sin(angle) * radius
      const geom1 = i % 5 === 0 ? highlightNodeGeom : nodeGeom
      const mat1 = i % 5 === 0 ? redMaterial : (i % 3 === 0 ? purpleMaterial : blueMaterial)
      const mesh1 = new THREE.Mesh(geom1, mat1)
      mesh1.position.set(x1, y, z1)
      dnaGroup.add(mesh1)
      spheresStrand1.push(mesh1)

      // Strand 2 Position (offset by Pi)
      const x2 = Math.cos(angle + Math.PI) * radius
      const z2 = Math.sin(angle + Math.PI) * radius
      const geom2 = i % 5 === 2 ? highlightNodeGeom : nodeGeom
      const mat2 = i % 5 === 2 ? redMaterial : (i % 3 === 1 ? purpleMaterial : blueMaterial)
      const mesh2 = new THREE.Mesh(geom2, mat2)
      mesh2.position.set(x2, y, z2)
      dnaGroup.add(mesh2)
      spheresStrand2.push(mesh2)

      // Connect Strands (Bonds)
      const points = [new THREE.Vector3(x1, y, z1), new THREE.Vector3(x2, y, z2)]
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points)
      const connectionLine = new THREE.Line(lineGeom, lineMaterial)
      dnaGroup.add(connectionLine)
    }

    // Grid Coordinates system (background particle field - covers full screen width)
    const particleCount = 280
    const particleGeom = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const originalPositions = new Float32Array(particleCount * 3)
    const speeds = new Float32Array(particleCount)
    const offsets = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      // Spawn particles across a much wider volume to cover full canvas width
      const rx = (Math.random() - 0.5) * 26 
      const ry = (Math.random() - 0.5) * 16 
      const rz = (Math.random() - 0.5) * 8 - 3 

      positions[i * 3] = rx
      positions[i * 3 + 1] = ry
      positions[i * 3 + 2] = rz

      originalPositions[i * 3] = rx
      originalPositions[i * 3 + 1] = ry
      originalPositions[i * 3 + 2] = rz

      speeds[i] = 0.2 + Math.random() * 0.4
      offsets[i] = Math.random() * Math.PI * 2
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Plus-sign texture drawing on an offscreen canvas
    const drawPlusTexture = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 16
      canvas.height = 16
      const ctx = canvas.getContext('2d')
      ctx.strokeStyle = '#001A70'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(8, 2)
      ctx.lineTo(8, 14)
      ctx.moveTo(2, 8)
      ctx.lineTo(14, 8)
      ctx.stroke()
      return new THREE.CanvasTexture(canvas)
    }

    const plusTexture = drawPlusTexture()
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.22,
      map: plusTexture,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    })

    const gridPoints = new THREE.Points(particleGeom, particleMaterial)
    scene.add(gridPoints)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9)
    keyLight.position.set(5, 8, 5)
    scene.add(keyLight)

    // Interactive point light (follows cursor)
    const pointerLight = new THREE.PointLight(accentPurple, 2.5, 12)
    pointerLight.position.set(0, 0, 3)
    scene.add(pointerLight)

    // Mouse Tracking Logic
    const mouse = { currentX: 0, currentY: 0, targetX: 0, targetY: 0 }

    const onMouseMove = (event) => {
      const rect = container.getBoundingClientRect()
      mouse.targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.targetY = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    // Attach listener globally to capture moves across the screen
    window.addEventListener('mousemove', onMouseMove)

    // Resize Handler
    const onResize = () => {
      if (!containerRef.current) return
      width = container.clientWidth
      height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    // Animation loop variables
    let animationFrameId
    const clock = new THREE.Clock()

    const renderTick = () => {
      animationFrameId = requestAnimationFrame(renderTick)

      const elapsed = clock.getElapsedTime()
      const isDesktop = window.innerWidth >= 1024

      // Helix self-spin
      dnaGroup.rotation.y = elapsed * 0.12

      // Ease mouse tracking (lerping)
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.06
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.06

      // Position DNA helix on the right side on desktop, centered on mobile
      const baseOffsetX = isDesktop ? 3.3 : 0
      dnaGroup.position.x = baseOffsetX + mouse.currentX * 0.4
      dnaGroup.position.y = mouse.currentY * 0.4

      // Rotate group toward mouse
      dnaGroup.rotation.x = mouse.currentY * 0.35
      dnaGroup.rotation.z = -mouse.currentX * 0.15

      // Follow cursor with point light (shifted by DNA base offset)
      pointerLight.position.x = baseOffsetX + mouse.currentX * 5
      pointerLight.position.y = mouse.currentY * 5

      // Estimate cursor 3D coordinates at Z=0 for repulsion
      const mouse3D = new THREE.Vector3(
        mouse.currentX * (isDesktop ? 7.0 : 4.5), 
        mouse.currentY * 4.5, 
        0
      )

      // Repulsion logic for floating particle field
      const positionsArray = particleGeom.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        const offset = offsets[i]
        const speed = speeds[i]
        
        // Base coordinate with floating wave motion over time
        const baseX = originalPositions[i * 3]
        const baseY = originalPositions[i * 3 + 1]
        const baseZ = originalPositions[i * 3 + 2] + Math.sin(elapsed * speed + offset) * 0.15

        // Vector math from mouse to particle
        const dx = baseX - mouse3D.x
        const dy = baseY - mouse3D.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        const repulsionRadius = 3.2
        let pushX = 0
        let pushY = 0
        let pushZ = 0

        if (dist < repulsionRadius) {
          const force = (repulsionRadius - dist) / repulsionRadius // 1 at center, 0 at edge
          const angle = Math.atan2(dy, dx)
          const strength = force * 0.8 // maximum repulsion displacement
          
          pushX = Math.cos(angle) * strength
          pushY = Math.sin(angle) * strength
          pushZ = force * 0.6 // push forward/backward
        }

        // Smooth spring-like lerping
        positionsArray[i * 3] += (baseX + pushX - positionsArray[i * 3]) * 0.1
        positionsArray[i * 3 + 1] += (baseY + pushY - positionsArray[i * 3 + 1]) * 0.1
        positionsArray[i * 3 + 2] += (baseZ + pushZ - positionsArray[i * 3 + 2]) * 0.1
      }
      particleGeom.attributes.position.needsUpdate = true

      // Pulsate sizes of red/highlighted medical nodes
      const pulseScale = 1.0 + Math.sin(elapsed * 2.8) * 0.14
      spheresStrand1.forEach((sphere, index) => {
        if (index % 5 === 0) {
          sphere.scale.set(pulseScale, pulseScale, pulseScale)
        }
      })
      spheresStrand2.forEach((sphere, index) => {
        if (index % 5 === 2) {
          sphere.scale.set(pulseScale, pulseScale, pulseScale)
        }
      })

      renderer.render(scene, camera)
    }

    renderTick()

    // Cleanup resources
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      nodeGeom.dispose()
      highlightNodeGeom.dispose()
      blueMaterial.dispose()
      redMaterial.dispose()
      purpleMaterial.dispose()
      lineMaterial.dispose()
      particleGeom.dispose()
      plusTexture.dispose()
      particleMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full absolute inset-0 z-0 pointer-events-none"
    />
  )
}

export default function Hero() {
  const { user } = useAuth()

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-artisan-dark bg-noise pt-24 pb-12 lg:pb-0"
    >
      {/* 3D Canvas Background (Full screen) */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-90">
        <Medical3DCanvas />
      </div>

      {/* Structured Surgical Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute top-0 left-0 w-full h-full grid grid-cols-12 grid-rows-6">
          <div className="col-span-1 border-r border-artisan-light h-full" />
          <div className="col-span-2 border-r border-artisan-light h-full" />
          <div className="col-span-3 border-r border-artisan-light h-full" />
          <div className="col-span-2 border-r border-artisan-light h-full" />
          <div className="col-span-2 border-r border-artisan-light h-full" />
          <div className="col-span-2 border-r border-artisan-light h-full" />
          
          <div className="row-span-1 border-b border-artisan-light w-full col-span-12" />
          <div className="row-span-2 border-b border-artisan-light w-full col-span-12" />
          <div className="row-span-2 border-b border-artisan-light w-full col-span-12" />
        </div>
      </div>

      {/* High-Tech Technical Specs on margins (Right-only) */}
      <div className="hidden xl:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-16 pointer-events-none z-10">
        <div className="w-px h-16 bg-artisan-light/10" />
        <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-artisan-grey/40 -rotate-90 origin-right whitespace-nowrap">
          [ SYS_STATUS // WEBGL_ACTIVE // 60 FPS ]
        </span>
      </div>

      <div className="container-custom relative z-10 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Premium content */}
          <div className="lg:col-span-7 xl:col-span-6 flex flex-col items-start text-left">
            
            {/* Pulsing Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 mb-6 px-3.5 py-1.5 bg-white border border-artisan-light/10 rounded-full shadow-sm backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#65A90D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#65A90D]"></span>
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] font-bold text-artisan-grey">
                Trusted by Healthcare Professionals
              </span>
            </motion.div>

            {/* Title / Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-display font-black uppercase tracking-tighter leading-[0.92] mb-6 text-artisan-light"
            >
              Surgical <br />
              <span className="text-artisan-grey">Supplies</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-sm sm:text-base text-artisan-light/60 max-w-lg mb-8 leading-relaxed font-normal"
            >
              Engineered for reliability. Certified for safety. Serving hospitals and clinics across India with precision surgical tools.
            </motion.p>

            {/* Action Group */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="flex flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Link to="/allproduct" className="flex-1 sm:flex-initial">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 bg-artisan-grey text-white font-display font-bold uppercase tracking-widest text-[10px] hover:bg-artisan-light transition-all duration-300 relative group overflow-hidden"
                >
                  <span className="relative z-10">Browse Products</span>
                  <div className="absolute inset-0 bg-artisan-light translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </motion.button>
              </Link>

              <Link 
                to={user ? (user.role === 'admin' ? '/admin' : '/profile') : '/signup'} 
                className="flex-1 sm:flex-initial"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 border border-artisan-light text-artisan-light font-display font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-artisan-light hover:text-white transition-all duration-300"
                >
                  {user ? (user.role === 'admin' ? 'Admin Hub' : 'Profile') : 'Join Us'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </Link>
            </motion.div>

          </div>

          {/* Right Column spacer */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6 h-[400px] pointer-events-none" />
          
        </div>
      </div>
    </section>
  )
}
