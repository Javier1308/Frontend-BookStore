"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, ShoppingCart, User, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useCartStore } from "@/stores/cart"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Menu as HeadlessMenu } from "@headlessui/react"

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCartStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">BookStore</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search books, authors, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <HeadlessMenu as="div" className="relative">
                  <HeadlessMenu.Button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    <User className="h-6 w-6" />
                    <span className="hidden md:block">{user?.first_name}</span>
                  </HeadlessMenu.Button>

                  <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""} flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                          >
                            <User className="mr-3 h-4 w-4" />
                            Profile
                          </Link>
                        )}
                      </HeadlessMenu.Item>

                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <Link
                            to="/orders"
                            className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""} flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                          >
                            <Settings className="mr-3 h-4 w-4" />
                            Orders
                          </Link>
                        )}
                      </HeadlessMenu.Item>

                      {user?.role === "admin" && (
                        <HeadlessMenu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin"
                              className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""} flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                            >
                              <Settings className="mr-3 h-4 w-4" />
                              Admin
                            </Link>
                          )}
                        </HeadlessMenu.Item>
                      )}

                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""} flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            Logout
                          </button>
                        )}
                      </HeadlessMenu.Item>
                    </div>
                  </HeadlessMenu.Items>
                </HeadlessMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button onClick={() => navigate("/register")}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
