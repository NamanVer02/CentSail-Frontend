'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiUser, FiMail, FiPhone, FiLogOut, FiArrowLeft, FiEdit, FiX } from 'react-icons/fi'
import { firebaseAuthService } from '@/lib/services/firebaseAuthService'
import { auth, storage } from '@/lib/config/firebase'
import { updateProfile, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { toast } from '@/lib/utils/toast'

export default function ProfilePage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [photoURL, setPhotoURL] = useState<string>('')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [pendingName, setPendingName] = useState<string>('')
  const [pendingPhoto, setPendingPhoto] = useState<string>('')
  const [pendingEmail, setPendingEmail] = useState<string>('')
  const [emailPassword, setEmailPassword] = useState<string>('')
  const [pendingPhone, setPendingPhone] = useState<string>('')
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null)
  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      setDisplayName(user.displayName || '')
      setEmail(user.email || '')
      setPhoneNumber(user.phoneNumber || '')
      setPhotoURL(user.photoURL || '')
      setPendingName(user.displayName || '')
      setPendingPhoto(user.photoURL || '')
      setPendingEmail(user.email || '')
      setPendingPhone(user.phoneNumber || '')
    }

    const unsub = auth.onAuthStateChanged(u => {
      if (u) {
        setDisplayName(u.displayName || '')
        setEmail(u.email || '')
        setPhoneNumber(u.phoneNumber || '')
        setPhotoURL(u.photoURL || '')
        setPendingName(u.displayName || '')
        setPendingPhoto(u.photoURL || '')
        setPendingEmail(u.email || '')
        setPendingPhone(u.phoneNumber || '')
      }
    })
    return () => unsub()
  }, [])

  const startEdit = () => {
    setPendingName(displayName || '')
    setPendingPhoto(photoURL || '')
    setPendingEmail(email || '')
    setPendingPhone(phoneNumber || '')
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setPendingName(displayName || '')
    setPendingPhoto(photoURL || '')
    setPendingEmail(email || '')
    setPendingPhone(phoneNumber || '')
    setEmailPassword('')
  }

  const saveEdit = async () => {
    if (!auth.currentUser) return
    setSaving(true)
    try {
      await updateProfile(auth.currentUser, {
        displayName: (pendingName || '').trim() || null as any,
        photoURL: (pendingPhoto || '').trim() || null as any,
      })
      setDisplayName((pendingName || '').trim())
      setPhotoURL((pendingPhoto || '').trim())
      const trimmedEmail = (pendingEmail || '').trim()
      if (trimmedEmail && trimmedEmail !== email) {
        if (!emailPassword) {
          throw new Error('Please enter your password to update email')
        }
        const cred = EmailAuthProvider.credential(email || '', emailPassword)
        await reauthenticateWithCredential(auth.currentUser, cred)
        await updateEmail(auth.currentUser, trimmedEmail)
        setEmail(trimmedEmail)
        setEmailPassword('')
      }
      // Update phone value locally (no OTP verification for now)
      if ((pendingPhone || '') !== (phoneNumber || '')) {
        setPhoneNumber((pendingPhone || '').trim())
      }
      setIsEditing(false)
      toast.success('Profile updated')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await firebaseAuthService.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // You could add a toast notification here for better UX
    }
  }

  const onPickPhoto = () => {
    if (isEditing) fileInputRef?.click()
  }
  const onFileSelected = async (file?: File) => {
    if (!file || !auth.currentUser) return
    try {
      const uid = auth.currentUser.uid
      const path = `users/${uid}/profile_${Date.now()}_${file.name}`
      const sref = storageRef(storage, path)
      await uploadBytes(sref, file)
      const url = await getDownloadURL(sref)
      setPendingPhoto(url)
      toast.success('Photo uploaded')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to upload image')
    }
  }

  // OTP/Recaptcha removed for now; phone is a simple editable field

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white">
       {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-transparent z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors"><FiArrowLeft /></button>
          <h1 className="text-lg font-semibold">Profile</h1>
          {!isEditing ? (
            <button onClick={startEdit} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors"><FiEdit /></button>
          ) : (
            <span className="w-10"/>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-24">
        <div className="flex flex-col items-center mb-8">
          {/* View-only header; editing moved to modal */}
          {photoURL ? (
            <img src={photoURL} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-white/30" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4 border-2 border-white/30">
              <FiUser className="text-5xl text-white" />
            </div>
          )}
          <h2 className="text-2xl font-bold">{displayName || '—'}</h2>
          <p className="text-white/60">{email || '—'}</p>
        </div>

        {/* Personal Info */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10 shadow-xl mb-6">
          <p className="text-xs text-white/50 uppercase tracking-wider">Personal Information</p>
          <div className="flex items-center">
            <FiMail className="text-xl text-white/60 mr-4" />
            <p>{email || '—'}</p>
          </div>
          <div className="flex items-center">
            <FiPhone className="text-xl text-white/60 mr-4" />
            <p>{phoneNumber || '—'}</p>
          </div>
        </div>


        {/* Notification Settings */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10 shadow-xl mb-8">
          <p className="text-xs text-white/50 uppercase tracking-wider">Notifications</p>
          <div className="flex items-center justify-between">
            <p>Push Notifications</p>
            <label className="switch"><input type="checkbox" defaultChecked /><span className="slider round"></span></label>
          </div>
           <div className="flex items-center justify-between">
            <p>Email Alerts</p>
            <label className="switch"><input type="checkbox" /><span className="slider round"></span></label>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-red-500/80 hover:bg-red-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors"
        >
          <FiLogOut className="mr-2" />
          Logout
        </button>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="w-full md:max-w-md bg-[#0c504a] text-white rounded-t-2xl md:rounded-2xl border border-white/10 p-5 pb-6">
            <div className="flex items-center justify-between mb-4">
              <button onClick={cancelEdit} className="text-xl p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close"><FiX /></button>
              <h2 className="text-lg font-semibold">Edit Profile</h2>
              <span className="w-10" />
            </div>
            <div className="flex flex-col items-center mb-4">
              <button onClick={onPickPhoto} className="rounded-full">
                {pendingPhoto ? (
                  <img src={pendingPhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-white/30" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-2 border-2 border-white/30">
                    <FiUser className="text-5xl text-white" />
                  </div>
                )}
              </button>
              <input ref={setFileInputRef} type="file" accept="image/*" className="hidden" onChange={e => onFileSelected(e.target.files?.[0] || undefined)} />
            </div>
            <div className="space-y-3">
              <input
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-white/40"
                placeholder="Display name"
                value={pendingName}
                onChange={e => setPendingName(e.target.value)}
              />
              <input
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-white/40"
                placeholder="Email"
                type="email"
                value={pendingEmail}
                onChange={e => setPendingEmail(e.target.value)}
              />
              {pendingEmail !== email && (
                <input
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-white/40"
                  placeholder="Confirm password to update email"
                  type="password"
                  value={emailPassword}
                  onChange={e => setEmailPassword(e.target.value)}
                />
              )}
              <input
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-white/40"
                placeholder="Phone"
                value={pendingPhone}
                onChange={e => setPendingPhone(e.target.value)}
              />
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button disabled={saving} onClick={cancelEdit} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20">Cancel</button>
              <button disabled={saving} onClick={saveEdit} className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
