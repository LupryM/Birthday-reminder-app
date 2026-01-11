"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ExternalLink,
  Gift,
  Plus,
  Check,
  Sparkles,
  Trash2,
  ShoppingBag,
  X,
} from "lucide-react";
import { AvatarRing } from "@/components/avatar-ring";
import {
  type Person,
  type WishlistItem,
  formatBirthdayFull,
  getDaysUntilBirthday,
} from "@/lib/data";
import { cn } from "@/lib/utils";

interface WishlistViewProps {
  person: Person;
  isOwnWishlist: boolean;
  onBack: () => void;
  onTogglePurchased?: (itemId: string) => void;
  onAddItem?: (title: string, url: string, price: number) => void;
  onDeleteItem?: (itemId: string) => void;
}

export function WishlistView({
  person,
  isOwnWishlist,
  onBack,
  onTogglePurchased,
  onAddItem,
  onDeleteItem,
}: WishlistViewProps) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddItem = () => {
    if (newItemTitle && onAddItem) {
      onAddItem(newItemTitle, newItemUrl, Number.parseFloat(newItemPrice) || 0);
      setNewItemTitle("");
      setNewItemUrl("");
      setNewItemPrice("");
      setShowAddForm(false);
    }
  };

  const daysUntil = getDaysUntilBirthday(person.birthday);
  const purchasedCount = person.wishlist.filter(
    (item) => item.purchased
  ).length;
  const totalCount = person.wishlist.length;

  return (
    <div className="min-h-screen pb-28 scroll-smooth-container">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-xl z-10 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-primary font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <div className="flex items-center gap-4">
            <AvatarRing src={person.avatar} alt={person.name} size="md" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {isOwnWishlist ? "My Wishlist" : `${person.name}'s Wishlist`}
              </h1>
              <p className="text-muted-foreground text-sm">
                {formatBirthdayFull(person.birthday)} · {daysUntil} days away
              </p>
            </div>
          </div>

          {!isOwnWishlist && totalCount > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gift className="w-4 h-4 text-primary" />
                  <span>
                    {purchasedCount} of {totalCount} purchased
                  </span>
                </div>
                <span className="text-sm font-medium text-primary">
                  {Math.round((purchasedCount / totalCount) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(purchasedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        <AnimatePresence mode="popLayout">
          {person.wishlist.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
            >
              <WishlistItemCard
                item={item}
                isOwnWishlist={isOwnWishlist}
                onTogglePurchased={onTogglePurchased}
                onDeleteItem={onDeleteItem}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {person.wishlist.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-card mx-auto mb-4 flex items-center justify-center border border-border">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium text-lg">No items yet</p>
            <p className="text-muted-foreground mt-1">
              {isOwnWishlist
                ? "Add items to your wishlist"
                : "This wishlist is empty"}
            </p>
          </motion.div>
        )}

        {isOwnWishlist && (
          <AnimatePresence mode="wait">
            {showAddForm ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-5 rounded-2xl border border-primary/30 bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      Add New Item
                    </h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="What do you want?"
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      className="rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground h-12"
                    />
                    <Input
                      placeholder="Link (optional)"
                      value={newItemUrl}
                      onChange={(e) => setNewItemUrl(e.target.value)}
                      className="rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground h-12"
                    />
                    <Input
                      placeholder="Price"
                      type="number"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground h-12"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 h-12 rounded-xl border-border bg-secondary hover:bg-secondary/80 text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddItem}
                      disabled={!newItemTitle}
                      className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    >
                      Add Item
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all bg-card/50"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-medium">Add New Item</span>
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

interface WishlistItemCardProps {
  item: WishlistItem;
  isOwnWishlist: boolean;
  onTogglePurchased?: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
}

function WishlistItemCard({
  item,
  isOwnWishlist,
  onTogglePurchased,
  onDeleteItem,
}: WishlistItemCardProps) {
  return (
    <Card
      className={cn(
        "p-4 rounded-2xl border transition-all",
        item.purchased
          ? "bg-primary/5 border-primary/20"
          : "bg-card border-border"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            item.purchased ? "bg-primary/20" : "bg-secondary"
          )}
        >
          <Gift
            className={cn(
              "w-5 h-5",
              item.purchased ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-semibold truncate",
              item.purchased
                ? "text-muted-foreground line-through"
                : "text-foreground"
            )}
          >
            {item.title}
          </h3>
          <p className="text-lg font-bold text-primary mt-0.5">
            ${item.price.toLocaleString()}
          </p>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mt-2 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Item
            </a>
          )}
        </div>

        {/* Purchase toggle for friend's wishlist */}
        {!isOwnWishlist && (
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Got it</span>
              <Switch
                checked={item.purchased}
                onCheckedChange={() => onTogglePurchased?.(item.id)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            {item.purchased && item.purchasedBy && (
              <span className="text-xs text-primary flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                <Check className="w-3 h-3" />
                {item.purchasedBy}
              </span>
            )}
          </div>
        )}

        {/* Own wishlist actions */}
        {isOwnWishlist && (
          <div className="flex items-center gap-2">
            {item.purchased ? (
              <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Surprise!</span>
              </div>
            ) : (
              onDeleteItem && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDeleteItem(item.id)}
                  className="p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              )
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
