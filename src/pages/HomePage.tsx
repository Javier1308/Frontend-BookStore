"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, BookOpen, Users, Award } from "lucide-react"
import { useBooksStore } from "@/stores/books"
import { useAuth } from "@/hooks/useAuth"
import { BookCard } from "@/components/books/BookCard"
import { Button } from "@/components/ui/Button"
import { BookCardSkeleton } from "@/components/ui/LoadingSkeleton"

export const HomePage: React.FC = () => {
  const { user } = useAuth()
  const { books, isLoading, fetchBooks } = useBooksStore()
  const [booksError, setBooksError] = useState(false)

  useEffect(() => {
    const loadBooks = async () => {
      try {
        await fetchBooks()
        setBooksError(false)
      } catch (error) {
        console.error("Failed to fetch books:", error)
        setBooksError(true)
      }
    }

    loadBooks()
  }, [fetchBooks])

  const featuredBooks = books.slice(0, 8)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Discover Your Next Great Read</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Explore thousands of books across all genres. From bestsellers to hidden gems, find the perfect book for
              every moment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/books">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700">
                  <span className="flex items-center">
                    Browse Books
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </Button>
              </Link>
              {!user && (
                <Link to="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                  >
                    Join Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">10,000+</h3>
              <p className="text-gray-600 dark:text-gray-400">Books Available</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">50,000+</h3>
              <p className="text-gray-600 dark:text-gray-400">Happy Readers</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">500+</h3>
              <p className="text-gray-600 dark:text-gray-400">Award Winners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Books</h2>
            <Link to="/books" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View All Books
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <BookCardSkeleton key={index} />
              ))}
            </div>
          ) : booksError ? (
            <div className="text-center py-12">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Unable to load featured books
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                  We're having trouble connecting to our book catalog. Please try again later.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <BookCard key={book.book_id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No featured books available at the moment.</p>
              <Link to="/books" className="mt-4 inline-block">
                <Button>Browse All Books</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Reading?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of readers who have discovered their next favorite book with us.
          </p>
          <Link to="/books">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700">
              Start Browsing
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
