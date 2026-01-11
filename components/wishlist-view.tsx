"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Gift, Plus, Check, Sparkles, Trash2 } from "lucide-react"
import { AvatarRing } from "@/components/avatar-ring"
import { type Person, type WishlistItem, formatBirthdayFull, getDaysUntilBirthday } from "@/lib/data"

interface WishlistViewProps {
  person: Person
  isOwnWishlist: boolean
  onBack: () => void
  onTogglePurchased?: (itemId: string) => void
  onAddItem?: (title: string, url: string, price: number) => void
  onDeleteItem?: (itemId: string) => void
}

export function WishlistView({
  person,
  isOwnWishlist,
  onBack,
  onTogglePurchased,
  onAddItem,
  onDeleteItem,
}: WishlistViewProps) {
  const [newItemTitle, setNewItemTitle] = useState("")
  const [newItemUrl, setNewItemUrl] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddItem = () => {
    if (newItemTitle && onAddItem) {
      onAddItem(newItemTitle, newItemUrl, Number.parseFloat(newItemPrice) || 0)
      setNewItemTitle("")
      setNewItemUrl("")
      setNewItemPrice("")
      setShowAddForm(false)
    }
  }

  const daysUntil = getDaysUntilBirthday(person.birthday)
  const purchasedCount = person.wishlist.filter((item) => item.purchased).length
  const totalCount = person.wishlist.length

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-xl z-10 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary font-medium mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-4">
            <AvatarRing src={person.avatar} alt={person.name} size="md" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                {isOwnWishlist ? "My Wishlist" : `${person.name}'s Wishlist`}
              </h1>
              <p className="text-muted-foreground text-sm">
                {formatBirthdayFull(person.birthday)} · {daysUntil} days away
              </p>
            </div>
          </div>

          {!isOwnWishlist && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Gift className="w-4 h-4 text-primary" />
              <span>
                {purchasedCount} of {totalCount} items marked as purchased
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {person.wishlist.map((item) => (
          <WishlistItemCard
            key={item.id}
            item={item}
            isOwnWishlist={isOwnWishlist}
            onTogglePurchased={onTogglePurchased}
            onDeleteItem={onDeleteItem}
          />
        ))}

        {person.wishlist.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No items on the wishlist yet</p>
          </div>
        )}

        {/* Add Item Form (only for own wishlist) */}
        {isOwnWishlist && (
          <>
            {showAddForm ? (
              <Card className="p-4 rounded-2xl border border-border bg-card space-y-4">
                <h3 className="font-medium text-foreground">Add New Item</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Item name"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    className="rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
                  />
                  <Input
                    placeholder="URL (optional)"
                    value={newItemUrl}
                    onChange={(e) => setNewItemUrl(e.target.value)}
                    className="rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 rounded-xl border-border bg-card hover:bg-secondary text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    disabled={!newItemTitle}
                    className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add Item
                  </Button>
                </div>
              </Card>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add New Item
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface WishlistItemCardProps {
  item: WishlistItem
  isOwnWishlist: boolean
  onTogglePurchased?: (itemId: string) => void
  onDeleteItem?: (itemId: string) => void
}

function WishlistItemCard({ item, isOwnWishlist, onTogglePurchased, onDeleteItem }: WishlistItemCardProps) {
  return (
    <Card className="p-4 rounded-2xl border border-border bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary shrink-0" />
            <h3 className="font-medium text-foreground truncate">{item.title}</h3>
          </div>
          <p className="text-lg font-semibold text-foreground mt-1">${item.price.toLocaleString()}</p>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
            >
              View Item <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Purchase toggle - only show for friend's wishlist */}
        {!isOwnWishlist && (
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Purchased</span>
              <Switch
                checked={item.purchased}
                onCheckedChange={() => onTogglePurchased?.(item.id)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            {item.purchased && item.purchasedBy && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Check className="w-3 h-3 text-primary" />
                by {item.purchasedBy}
              </span>
            )}
          </div>
        )}

        {isOwnWishlist && (
          <div className="flex items-center gap-2">
            {item.purchased && (
              <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span className="text-xs font-medium">Surprise!</span>
              </div>
            )}
            {!item.purchased && onDeleteItem && (
              <button
                onClick={() => onDeleteItem(item.id)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
