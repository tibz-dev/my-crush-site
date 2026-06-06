import React, { useState, useEffect, useRef, useCallback } from 'react'
import emailjs from 'emailjs-com'

// ── Env vars ───────────────────────────────────────────────────────────────
const CRUSH_NAME  = import.meta.env.VITE_CRUSH_NAME   || 'Sunshine'
const CRUSH_EMAIL = import.meta.env.VITE_CRUSH_EMAIL  || ''
const MY_EMAIL    = import.meta.env.VITE_MY_EMAIL     || ''

const EMAILJS_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_KEY      = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const SPOTIFY_EMBED = import.meta.env.VITE_SPOTIFY_EMBED_URL || ''
const SONG_TITLE    = import.meta.env.VITE_SONG_TITLE   || 'Perfect'
const SONG_ARTIST   = import.meta.env.VITE_SONG_ARTIST  || 'Ed Sheeran'
const SONG_NOTE     = import.meta.env.VITE_SONG_NOTE    || 'This song plays in my head every time I think of you. 🎵'

// Collect photos from env
const PHOTOS = Array.from({ length: 12 }, (_, i) =>
  import.meta.env[`VITE_PHOTO_${i + 1}`]
).filter(Boolean)

// ── Helpers ────────────────────────────────────────────────────────────────
function spawnConfetti() {
  const colors = ['#e84054','#ff9eb5','#ffd6de','#ffb347','#fff','#c084fc']
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div')
    el.className = 'confetti-piece'
    el.style.left  = `${Math.random() * 100}vw`
    el.style.top   = `-${Math.random() * 20}px`
    el.style.background = colors[Math.floor(Math.random() * colors.length)]
    el.style.width  = `${Math.random() * 10 + 6}px`
    el.style.height = `${Math.random() * 10 + 6}px`
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
    el.style.animationDuration = `${Math.random() * 2 + 1.5}s`
    el.style.animationDelay   = `${Math.random() * 0.8}s`
    document.body.appendChild(el)
    el.addEventListener('animationend', () => el.remove())
  }
}

// ── Particles ──────────────────────────────────────────────────────────────
function Particles() {
  const symbols = ['✦', '✧', '·', '⋆', '✿', '❀', '♡', '◇', '∘']
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 35 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-rose-300/20 select-none"
          style={{
            left: `${Math.random() * 100}%`,
            top:  `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 18 + 8}px`,
            animation: `float ${3 + Math.random() * 5}s ease-in-out ${Math.random() * 4}s infinite`,
          }}
        >
          {symbols[Math.floor(Math.random() * symbols.length)]}
        </div>
      ))}
    </div>
  )
}

// ── Typewriter ─────────────────────────────────────────────────────────────
function Typewriter({ text, delay = 0, speed = 60, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone]           = useState(false)

  useEffect(() => {
    let timeout
    const start = setTimeout(() => {
      let idx = 0
      const tick = () => {
        setDisplayed(text.slice(0, idx + 1))
        idx++
        if (idx < text.length) timeout = setTimeout(tick, speed)
        else { setDone(true); onDone?.() }
      }
      tick()
    }, delay)
    return () => { clearTimeout(start); clearTimeout(timeout) }
  }, [text])

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse text-rose-400">|</span>}
    </span>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({ children, className = '' }) {
  const ref = useRef()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}>
      {children}
    </div>
  )
}

// ── Vinyl Record ───────────────────────────────────────────────────────────
function VinylRecord({ playing }) {
  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      {/* Outer vinyl */}
      <div
        className={`w-32 h-32 rounded-full border-4 border-rose-900/60 flex items-center justify-center ${playing ? 'animate-vinyl' : ''}`}
        style={{ background: 'conic-gradient(from 0deg, #1a0010, #2d0018, #1a0010, #3d0022, #1a0010)' }}
      >
        {/* Grooves */}
        {[28, 36, 44, 52].map(s => (
          <div key={s} className="absolute rounded-full border border-rose-900/30" style={{ width: s * 2, height: s * 2 }} />
        ))}
        {/* Label */}
        <div className="w-12 h-12 rounded-full bg-rose-500/80 flex items-center justify-center z-10 text-white text-lg">
          🎵
        </div>
        {/* Center hole */}
        <div className="absolute w-2 h-2 rounded-full bg-rose-900 z-20" />
      </div>
    </div>
  )
}

// ── Song Dedication ────────────────────────────────────────────────────────
function SongDedication() {
  const [playing, setPlaying] = useState(false)

  return (
    <Section>
      <div className="glass-card rounded-3xl p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🎶</span>
          <h3 className="text-white/80 text-sm uppercase tracking-widest font-medium">A song for you</h3>
        </div>

        {SPOTIFY_EMBED ? (
          /* ── Real Spotify embed ── */
          <div className="rounded-2xl overflow-hidden">
            <iframe
              src={SPOTIFY_EMBED}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Song dedication"
              className="rounded-2xl"
            />
          </div>
        ) : (
          /* ── Styled fallback card ── */
          <div className="flex items-center gap-6">
            <VinylRecord playing={playing} />
            <div className="flex-1">
              <p className="text-white text-2xl font-serif mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {SONG_TITLE}
              </p>
              <p className="text-rose-300/70 text-sm mb-3">{SONG_ARTIST}</p>
              <p className="text-white/40 text-sm leading-relaxed italic mb-4">"{SONG_NOTE}"</p>
              <button
                onClick={() => setPlaying(p => !p)}
                className="flex items-center gap-2 bg-rose-500/20 hover:bg-rose-500/30 
                           border border-rose-500/30 text-rose-300 text-sm px-5 py-2 
                           rounded-full transition-all duration-200 cursor-pointer"
              >
                {playing ? '⏸ Pause' : '▶ Play'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

// ── Photo Gallery ──────────────────────────────────────────────────────────
function PhotoGallery() {
  const [selected, setSelected] = useState(null)

  const photos = PHOTOS.length > 0 ? PHOTOS : [
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
    'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=400',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400',
    'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=400',
    'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=400',
  ]

  return (
    <Section>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6 px-1">
          <span className="text-2xl">📸</span>
          <h3 className="text-white/80 text-sm uppercase tracking-widest font-medium">Our little memory wall</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {photos.map((src, i) => (
            <div
              key={i}
              className="photo-card aspect-square rounded-2xl overflow-hidden cursor-pointer 
                         hover:scale-105 hover:z-10 relative transition-transform duration-200
                         border border-white/5 hover:border-rose-400/30"
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => setSelected(src)}
            >
              <img
                src={src}
                alt={`Memory ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Soft vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-2 right-2 text-white/40 text-xs">
                {['✦','♡','✿','⋆','✧','·'][i % 6]}
              </div>
            </div>
          ))}
        </div>

  
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-lg w-full">
            <img src={selected} alt="Memory" className="w-full rounded-3xl shadow-2xl" />
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-rose-500/80 
                         text-white flex items-center justify-center text-lg hover:bg-rose-400 
                         transition-colors cursor-pointer"
            >
              ×
            </button>
            <div className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-xs">
              click anywhere to close
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}

// ── Ask Out Section ────────────────────────────────────────────────────────
function AskOut({ onYes }) {
  const [noCount, setNoCount] = useState(0)
  const [noPos, setNoPos]     = useState({ x: 0, y: 0 })
  const yesScale = 1 + noCount * 0.18

  const dodge = useCallback(() => {
    const m = 80
    setNoPos({
      x: Math.random() * (window.innerWidth  - 2 * m) + m,
      y: Math.random() * (window.innerHeight - 2 * m) + m,
    })
    setNoCount(c => c + 1)
  }, [])

  const handleNo = () => {
    if (noCount >= 4) { spawnConfetti(); onYes() }
    else dodge()
  }

  const noPhrases = ['Nope 🙈', 'Try again!', 'Nuh-uh ✦', 'Getting warmer…', "You can't catch me!"]

  return (
    <Section className="text-center py-20 px-6">
      <div className="text-6xl mb-6 animate-float inline-block">🥺</div>
      <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
        <Typewriter text={`Would you go on a date with me, ${CRUSH_NAME}?`} speed={50} />
      </h2>
      <p className="text-rose-200/50 text-base mb-12">
        Good coffee, terrible jokes, and 100% genuine smiles ☕
      </p>
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => { spawnConfetti(); onYes() }}
          style={{ transform: `scale(${yesScale})`, transition: 'transform 0.3s ease' }}
          className="bg-rose-500 hover:bg-rose-400 text-white px-12 py-4 rounded-full 
                     text-xl font-semibold shadow-lg hover:shadow-rose-500/40 
                     transition-all duration-200 cursor-pointer animate-pulse-glow"
        >
          Yes! 💌
        </button>
        <button
          onClick={handleNo}
          onMouseEnter={noCount > 0 ? dodge : undefined}
          style={noCount > 0
            ? { position: 'fixed', left: noPos.x, top: noPos.y, transform: 'translate(-50%,-50%)', zIndex: 50 }
            : {}}
          className="text-white/30 hover:text-white/50 text-sm underline underline-offset-4 
                     transition-colors duration-200 cursor-pointer"
        >
          {noPhrases[Math.min(noCount, noPhrases.length - 1)]}
        </button>
      </div>
      {noCount > 0 && (
        <p className="text-rose-300/40 text-xs mt-8">
          {['', 'Hmm, suspicious… 👀', 'The NO button is scared 😅', 'Almost impossible to press…', 'Ok it gave up. YES it is 🎊'][Math.min(noCount, 4)]}
        </p>
      )}
    </Section>
  )
}

// ── YES screen ─────────────────────────────────────────────────────────────
function YesScreen({ emailSent, emailErr }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 z-10 relative">
      <div className="text-center max-w-lg animate-fadeUp">
        <div className="text-7xl mb-6 animate-wiggle inline-block">🎉</div>
        <h2 className="font-serif text-4xl md:text-5xl text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          <Typewriter text="She said yes! 🌹" speed={70} />
        </h2>
        <p className="text-rose-200/60 text-base mb-6 leading-relaxed">
          A little love note is flying to{' '}
          <span className="text-rose-300 font-medium">{CRUSH_EMAIL}</span>.<br />
          I'm already planning the perfect evening. 🌸
        </p>
        {emailSent && (
          <div className="glass rounded-2xl px-6 py-4 text-rose-300/80 text-sm">
            ✉️ Emails sent — to {CRUSH_NAME} & to you!
          </div>
        )}
        {emailErr && (
          <div className="glass rounded-2xl px-6 py-4 text-yellow-300/70 text-sm">
            ⚠️ Couldn't send emails (check EmailJS config) — but the YES is still valid! 💛
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase]         = useState('site')  // site | yes
  const [emailSent, setEmailSent] = useState(false)
  const [emailErr, setEmailErr]   = useState(false)

 const handleYes = async () => {
  setPhase('yes')
  if (!EMAILJS_SERVICE || !EMAILJS_TEMPLATE || !EMAILJS_KEY) return
  try {
    // Email to your crush
    await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
      name:    `Someone who adores ${CRUSH_NAME}`,
      email:   MY_EMAIL,
      message: `Hey ${CRUSH_NAME} 🌹 Someone very special made you a whole website. They think you're absolutely wonderful — and they'd love to take you on a date. 💌`,
    }, EMAILJS_KEY)

    // Email to yourself (confirmation)
    await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
      name:    CRUSH_NAME,
      email:   CRUSH_EMAIL,
      message: `🎉 ${CRUSH_NAME} said YES! Time to plan the perfect date. 🌹`,
    }, EMAILJS_KEY)

    setEmailSent(true)
  } catch (e) {
    console.error(e)
    setEmailErr(true)
  }
}

  if (phase === 'yes') {
    return (
      <div className="relative min-h-screen" style={{ background: 'radial-gradient(ellipse at 60% 0%, #1a0010 0%, #0a0a0f 60%)' }}>
        <Particles />
        <YesScreen emailSent={emailSent} emailErr={emailErr} />
      </div>
    )
  }

  return (
    <div className="relative" style={{ background: 'radial-gradient(ellipse at 60% 0%, #1a0010 0%, #0a0a0f 60%)' }}>
      <Particles />

      {/* ── Hero ── */}
      <div className="min-h-screen flex items-center justify-center text-center px-6 z-10 relative">
        <div>
          <div className="text-7xl mb-6 animate-heartbeat inline-block">🌹</div>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="shimmer-text">Hey, {CRUSH_NAME}.</span>
          </h1>
          <p className="text-rose-200/60 text-lg mb-10 leading-relaxed max-w-sm mx-auto animate-fadeUp" style={{ animationDelay: '0.4s' }}>
            Someone made a whole website just for you.<br />
            That's kind of a big deal. 🤍
          </p>
          
          <button
            onClick={() => document.getElementById('song').scrollIntoView({ behavior: 'smooth' })}
            className="glass px-10 py-4 rounded-full text-white text-lg font-medium 
                       hover:bg-rose-500/20 transition-all duration-300 animate-pulse-glow 
                       inline-block cursor-pointer border-0 bg-transparent"
          >
            Keep scrolling ↓
          </button>
          {/* Scroll hint */}
          <div className="mt-16 animate-scroll-hint text-white/20 text-2xl">⌄</div>
          {/* Scroll hint */}
          <div className="mt-16 animate-scroll-hint text-white/20 text-2xl">⌄</div>
        </div>
      </div>

      {/* ── Song Dedication ── */}
      <div id="song" className="px-6 py-16 z-10 relative">
        <SongDedication />
      </div>

      {/* ── Divider ── */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="border-t border-rose-900/30 my-4" />
      </div>

      {/* ── Photo Gallery ── */}
      <div className="px-6 py-16 z-10 relative">
        <PhotoGallery />
      </div>

      {/* ── Divider ── */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="border-t border-rose-900/30 my-4" />
      </div>

      {/* ── Ask Out ── */}
      <div id="askout" className="z-10 relative">
        <AskOut onYes={handleYes} />
      </div>

      {/* ── Footer ── */}
      <div className="text-center pb-12 text-white/15 text-xs z-10 relative">
        made with 🌹 just for {CRUSH_NAME}
      </div>
    </div>
  )
}