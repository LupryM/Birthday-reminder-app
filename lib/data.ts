export interface WishlistItem {
  id: string
  title: string
  price: number
  url: string
  purchased: boolean
  purchasedBy?: string
}

export interface Person {
  id: string
  name: string
  avatar: string
  birthday: Date
  age: number
  role?: string
  wishlist: WishlistItem[]
}

export const currentUser: Person = {
  id: "user-1",
  name: "You",
  avatar: "/placeholder.svg?height=120&width=120",
  birthday: new Date(2000, 3, 15),
  age: 25,
  wishlist: [
    {
      id: "item-1",
      title: "Apple AirPods Pro 2",
      price: 249,
      url: "https://apple.com/airpods-pro",
      purchased: true,
      purchasedBy: "Valentina Cruz",
    },
    {
      id: "item-2",
      title: "Kindle Paperwhite",
      price: 149,
      url: "https://amazon.com/kindle",
      purchased: false,
    },
    {
      id: "item-3",
      title: "PlayStation 5 Controller",
      price: 69,
      url: "https://playstation.com",
      purchased: true,
      purchasedBy: "Marcus Johnson",
    },
  ],
}

export const initialFriends: Person[] = [
  {
    id: "friend-1",
    name: "Valentina Cruz",
    avatar: "/placeholder.svg?height=80&width=80",
    birthday: new Date(2002, 10, 3),
    age: 23,
    role: "Friend",
    wishlist: [
      {
        id: "val-1",
        title: "Sony WH-1000XM5 Headphones",
        price: 349,
        url: "https://sony.com",
        purchased: false,
      },
      {
        id: "val-2",
        title: "Sephora Gift Card",
        price: 100,
        url: "https://sephora.com",
        purchased: true,
        purchasedBy: "You",
      },
    ],
  },
  {
    id: "friend-2",
    name: "Brianna Washington",
    avatar: "/placeholder.svg?height=80&width=80",
    birthday: new Date(2001, 0, 3),
    age: 24,
    role: "Friend",
    wishlist: [
      {
        id: "bri-1",
        title: "Nike Dunks",
        price: 120,
        url: "https://nike.com",
        purchased: false,
      },
      {
        id: "bri-2",
        title: "Spotify Premium - 1 Year",
        price: 99,
        url: "https://spotify.com",
        purchased: false,
      },
    ],
  },
  {
    id: "friend-3",
    name: "Imani Robinson",
    avatar: "/placeholder.svg?height=80&width=80",
    birthday: new Date(2000, 1, 11),
    age: 25,
    role: "Friend",
    wishlist: [
      {
        id: "imani-1",
        title: "Dyson Airwrap",
        price: 599,
        url: "https://dyson.com",
        purchased: false,
      },
      {
        id: "imani-2",
        title: "Lululemon Gift Card",
        price: 150,
        url: "https://lululemon.com",
        purchased: true,
        purchasedBy: "Valentina Cruz",
      },
    ],
  },
  {
    id: "friend-4",
    name: "Lucas Parker",
    avatar: "/placeholder.svg?height=80&width=80",
    birthday: new Date(1999, 2, 8),
    age: 26,
    role: "Friend",
    wishlist: [
      {
        id: "lucas-1",
        title: "Nintendo Switch OLED",
        price: 349,
        url: "https://nintendo.com",
        purchased: false,
      },
    ],
  },
  {
    id: "friend-5",
    name: "Scarlett Brennan",
    avatar: "/placeholder.svg?height=80&width=80",
    birthday: new Date(2001, 2, 17),
    age: 24,
    role: "Friend",
    wishlist: [
      {
        id: "scar-1",
        title: "Kindle Paperwhite",
        price: 149,
        url: "https://amazon.com/kindle",
        purchased: false,
      },
      {
        id: "scar-2",
        title: "Candle Set",
        price: 65,
        url: "https://yankeecandle.com",
        purchased: false,
      },
    ],
  },
  {
    id: "friend-6",
    name: "Gabriel Hendrix",
    avatar: "/placeholder.svg?height=80&width=80",
    birthday: new Date(2000, 2, 22),
    age: 25,
    role: "Friend",
    wishlist: [
      {
        id: "gab-1",
        title: "PS5 Game - GTA VI",
        price: 69,
        url: "https://rockstargames.com",
        purchased: false,
      },
    ],
  },
]

export function getDaysUntilBirthday(birthday: Date): number {
  const today = new Date()
  const thisYear = today.getFullYear()

  let nextBirthday = new Date(thisYear, birthday.getMonth(), birthday.getDate())

  if (nextBirthday < today) {
    nextBirthday = new Date(thisYear + 1, birthday.getMonth(), birthday.getDate())
  }

  const diffTime = nextBirthday.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

export function getHoursUntilBirthday(birthday: Date): number {
  const today = new Date()
  const thisYear = today.getFullYear()

  let nextBirthday = new Date(thisYear, birthday.getMonth(), birthday.getDate())

  if (nextBirthday < today) {
    nextBirthday = new Date(thisYear + 1, birthday.getMonth(), birthday.getDate())
  }

  const diffTime = nextBirthday.getTime() - today.getTime()
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  return diffHours
}

export function formatBirthday(birthday: Date): string {
  return birthday.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function formatBirthdayFull(birthday: Date): string {
  return birthday.toLocaleDateString("en-US", { month: "long", day: "numeric" })
}

export function sortByUpcomingBirthday(friends: Person[]): Person[] {
  return [...friends].sort((a, b) => getDaysUntilBirthday(a.birthday) - getDaysUntilBirthday(b.birthday))
}

export function isBirthdayToday(birthday: Date): boolean {
  const today = new Date()
  return birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate()
}
