"use client";

import type React from "react";
import { useState, useRef } from "react";
import { X, Camera, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageCropper } from "@/components/image-cropper";
import { NotificationToggle } from "@/components/notification-toggle";
import { createClient } from "@/lib/supabase/client";

interface ProfileEditModalProps {
  profile: {
    id: string;
    name: string;
    avatar: string;
    birthday: Date;
    role?: string;
  };
  onClose: () => void;
  onSave: (updates: {
    name: string;
    birthday: string;
    role: string;
    avatar_url?: string;
  }) => Promise<void>;
  onDeleteAccount: () => void;
}

export function ProfileEditModal({
  profile,
  onClose,
  onSave,
  onDeleteAccount,
}: ProfileEditModalProps) {
  const [name, setName] = useState(profile.name);
  const [birthday, setBirthday] = useState(
    profile.birthday.toISOString().split("T")[0]
  );
  const [role, setRole] = useState(profile.role || "");
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setRawImageSrc(e.target?.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (blob: Blob) => {
    setCroppedBlob(blob);
    setAvatarPreview(URL.createObjectURL(blob));
    setShowCropper(false);
    setRawImageSrc(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setRawImageSrc(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatar_url: string | undefined;

      if (croppedBlob) {
        const fileName = `${profile.id}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, croppedBlob, {
            upsert: true,
            contentType: "image/jpeg",
          });

        if (uploadError) {
          console.error("Error uploading avatar:", uploadError);
          alert("Failed to upload image. Check console for details.");
        } else {
          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(fileName);
          avatar_url = publicUrl;
        }
      }

      await onSave({ name, birthday, role, avatar_url });
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("An error occurred while saving your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (showCropper && rawImageSrc) {
    return (
      <ImageCropper
        imageSrc={rawImageSrc}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    );
  }

  if (showDeleteConfirm) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border rounded-3xl w-full max-w-sm p-6"
        >
          <h2 className="text-xl font-bold text-foreground text-center mb-2">
            Delete Account?
          </h2>
          <p className="text-muted-foreground text-center text-sm mb-6">
            This will permanently delete your profile, wishlist, and all
            messages. This action cannot be undone.
          </p>
          <div className="space-y-3">
            <Button
              onClick={onDeleteAccount}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium min-h-[48px]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Yes, Delete My Account
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              variant="outline"
              className="w-full h-12 border-border bg-secondary hover:bg-secondary/80 text-foreground rounded-xl font-medium min-h-[48px]"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </motion.button>
          <span className="text-foreground font-semibold">Edit Profile</span>
          <div className="w-11" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Section - FIXED */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              {/* Fixed: Proper circular clipping with no gaps */}
              <div className="w-full h-full rounded-full overflow-hidden bg-card">
                <img
                  src={avatarPreview || "https://via.placeholder.com/150"}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Ring overlay on top */}
              <div className="absolute inset-0 rounded-full border-4 border-primary pointer-events-none" />

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-card min-h-[44px] min-w-[44px]"
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tap to change photo
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground"
              placeholder="Your name"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Role in the Apes
            </label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-12 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground"
              placeholder="e.g. The Alpha, The Foodie, OG Member..."
            />
          </div>

          {/* Birthday */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Birthday
            </label>
            <Input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="h-12 bg-secondary border-0 rounded-xl text-foreground"
            />
          </div>

          {/* Notifications */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Notifications
            </label>
            <NotificationToggle />
          </div>

          {/* Save Button */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium min-h-[48px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </motion.div>

          {/* Delete Account */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-center text-sm text-red-500 hover:text-red-400 py-2 min-h-[44px]"
          >
            Delete My Account
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
