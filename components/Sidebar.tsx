'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Menu, X, TorusIcon, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/components/LanguageProvider'

type ToolGroup = {
  name: string
  icon: React.ElementType
  items: { name: string; href: string }[]
}

const toolGroups: ToolGroup[] = [
  {
    name: 'Tools',
    icon: TorusIcon,
    items: [
      { name: 'Burn Token', href: '/tools/burntoken' },
      { name: 'SOL Transfer', href: '/tools/soltransfer' },
      { name: 'Tool 3', href: '/tools/tool3' },
    ],
  },
  {
    name: 'Manage Tools',
    icon: Settings,
    items: [
      { name: 'Manage Tool 1', href: '/manage/tool1' },
      { name: 'Manage Tool 2', href: '/manage/tool2' },
      { name: 'Manage Tool 3', href: '/manage/tool3' },
    ],
  },
]

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const { theme } = useTheme()
  const { t } = useLanguage()

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)
      setIsOpen(!isMobileView)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => setIsOpen(!isOpen)

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((name) => name !== groupName)
        : [...prev, groupName]
    )
  }

  return (
    <>
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
      <div
        className={cn(
          'bg-gray-50 border-r transition-all duration-300 ease-in-out flex flex-col',
          isOpen || isMobileOpen ? 'w-64' : 'w-16',
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200',
          isMobile ? 'fixed inset-y-0 left-0 z-50 shadow-lg' : '',
          isMobile && !isMobileOpen ? '-translate-x-full' : ''
        )}
      >
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className={cn(
              "p-2 m-2 rounded-md",
              theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-800'
            )}
            aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              "p-2 m-2 rounded-md",
              theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-800'
            )}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        )}
        <div className={cn("flex flex-col flex-1 overflow-y-auto", !isOpen && !isMobile && "items-center")}>
          {toolGroups.map((group) => (
            <div key={group.name} className="mb-4">
              <button
                onClick={() => (isOpen || isMobile) && toggleGroup(group.name)}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-2 text-left",
                  theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-800'
                )}
              >
                <div className="flex items-center">
                  <group.icon size={20} className="mr-2" />
                  {(isOpen || isMobile) && t(group.name)}
                </div>
                {(isOpen || isMobile) && (
                  expandedGroups.includes(group.name) ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )
                )}
              </button>
              {(isOpen || isMobile) && expandedGroups.includes(group.name) && (
                <div className="ml-4">
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "block px-4 py-2 text-sm",
                        theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                      )}
                    >
                      {t(item.name)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
// 'use client'

// import { useState } from 'react'
// import Link from 'next/link'
// import { ChevronDown, ChevronRight, Menu, X, TorusIcon, Settings } from 'lucide-react'
// import { cn } from '@/lib/utils'
// import { useTheme } from 'next-themes'
// import { useLanguage } from '@/components/LanguageProvider'

// type ToolGroup = {
//   name: string
//   icon: React.ElementType
//   items: { name: string; href: string }[]
// }

// const toolGroups: ToolGroup[] = [
//   {
//     name: 'Tools',
//     icon: TorusIcon,
//     items: [
//       { name: 'Burn Token', href: '/tools/burntoken' },
//       { name: 'SOL Transfer', href: '/tools/soltransfer' },
//       { name: 'Tool 3', href: '/tools/tool3' },
//     ],
//   },
//   {
//     name: 'Manage Tools',
//     icon: Settings,
//     items: [
//       { name: 'Manage Tool 1', href: '/manage/tool1' },
//       { name: 'Manage Tool 2', href: '/manage/tool2' },
//       { name: 'Manage Tool 3', href: '/manage/tool3' },
//     ],
//   },
// ]

// export default function Sidebar() {
//   const [isOpen, setIsOpen] = useState(true)
//   const [expandedGroups, setExpandedGroups] = useState<string[]>([])
//   const { theme } = useTheme()
//   const { t } = useLanguage()

//   const toggleSidebar = () => setIsOpen(!isOpen)

//   const toggleGroup = (groupName: string) => {
//     setExpandedGroups((prev) =>
//       prev.includes(groupName)
//         ? prev.filter((name) => name !== groupName)
//         : [...prev, groupName]
//     )
//   }

//   return (
//     <div
//       className={cn(
//         'bg-gray-50 border-r transition-all duration-300 ease-in-out flex flex-col',
//         isOpen ? 'w-64' : 'w-16',
//         theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200'
//       )}
//     >
//       <button
//         onClick={toggleSidebar}
//         className={cn(
//           "p-2 m-2 rounded-md",
//           theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-800'
//         )}
//         aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
//       >
//         {isOpen ? <X size={20} /> : <Menu size={20} />}
//       </button>
//       <div className={cn("flex flex-col flex-1 overflow-y-auto", !isOpen && "items-center")}>
//         {toolGroups.map((group) => (
//           <div key={group.name} className="mb-4">
//             <button
//               onClick={() => isOpen && toggleGroup(group.name)}
//               className={cn(
//                 "flex items-center justify-between w-full px-4 py-2 text-left",
//                 theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-800'
//               )}
//             >
//               <div className="flex items-center">
//                 <group.icon size={20} className="mr-2" />
//                 {isOpen && t(group.name)}
//               </div>
//               {isOpen && (
//                 expandedGroups.includes(group.name) ? (
//                   <ChevronDown size={20} />
//                 ) : (
//                   <ChevronRight size={20} />
//                 )
//               )}
//             </button>
//             {isOpen && expandedGroups.includes(group.name) && (
//               <div className="ml-4">
//                 {group.items.map((item) => (
//                   <Link
//                     key={item.name}
//                     href={item.href}
//                     className={cn(
//                       "block px-4 py-2 text-sm",
//                       theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
//                     )}
//                   >
//                     {t(item.name)}
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }