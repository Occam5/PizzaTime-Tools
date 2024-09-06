import './globals.css'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-4xl">   </p>
      <h1 className="text-3xl font-bold mb-6 text-purple-400">Welcome to Our Tools Website</h1>
      
      <section className="mb-12">
        <Link href="https://vs-fabulous-site-7daf62.webflow.io/">
          <h2 className="text-2xl font-semibold mb-4 hover:text-yellow-400">About Our Team</h2>
        </Link>        
        <p className="text-gray-600">
          We are a dedicated team of developers and designers passionate about creating useful tools for the community. Our goal is to simplify complex tasks and provide innovative solutions to everyday problems.
        </p>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-purple-400">Latest Blog Posts</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-medium mb-2">Blog Post Title 1</h3>
            <p className="text-gray-600">A brief preview of the blog post content...</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-medium mb-2">Blog Post Title 2</h3>
            <p className="text-gray-600">Another brief preview of blog post content...</p>
          </div>
        </div>
      </section>
    </div>
  )
}