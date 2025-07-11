import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
  import { Menu, LogOut } from "lucide-react"
  import { Button } from "@/components/ui/button"
  import ThemeToggle from "@/components/ThemeToggle"
  
  const Header = ({ user, handleLogout }) => {
    return (
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            TaskFlow
          </h1>
  
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name || "User"}!
            </p>
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-600 dark:text-red-400"
            >
              Logout
            </Button>
          </div>
  
          {/* Mobile Menu */}
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="p-5">
                <SheetHeader>
                  <SheetTitle className="text-xl">
                    TaskFlow Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Welcome back, {user?.name || "User"}!
                  </p>
                  <ThemeToggle />
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    )
  }
  
  export default Header
  