"use client"

import { Sidebar } from "@/components/sidebar"
import { PageLoader } from "@/components/page-loader"
import ProtectedRoute from "@/components/protected-route"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <PageLoader />
        
        {/* Desktop Sidebar - Fixed */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-72 lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="lg:ml-72">
          {/* Mobile Header - Simplified */}
          <header className="lg:hidden bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Ouvrir le menu</span>
                    </Button>
                  </SheetTrigger>
                </Sheet>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                    <img 
                      src="/images/logo.png" 
                      alt="AKILI Logo" 
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight">AKILI Mobile</h1>
                    <p className="text-xs text-primary-foreground/80 font-medium">Administration</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          

          
          {/* Page content - No header on desktop */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background to-muted/20">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}