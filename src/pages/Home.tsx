import MenuCard from "@/components/MenuCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useGetItems from "@/hooks/useGetItems";
import useGetKitchenStatus from "@/hooks/useGetKitchenStatus";
import { Phone, SearchIcon, ShoppingCartIcon, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.jpg";
import waiter from "../assets/waiter.jpg";
import { Avatar, AvatarImage } from "../components/ui/avatar";
import useRegisterUser from "@/hooks/useUserRegister";
import user from "../assets/user.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Item interface for each food item
interface Item {
  _id: string;
  name: string;
  price: number;
  image: string;
  nonVeg: boolean;
  availability: boolean;
  quantity?: number;
}

// ModalProps interface for Modal component
interface ModalProps {
  isOpen: boolean;
}

// Modal component to display when the restaurant is closed
const Modal: React.FC<ModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white rounded-lg p-6 w-80 text-center">
        <h2 className="text-xl font-bold mb-4">Restaurant is Closed</h2>
        <img src={waiter} alt="Closed" className="mb-4" />
        <p>We're currently closed. Please come back later.</p>
      </div>
    </div>
  );
};

// Home component for displaying the menu
const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState(""); // State to hold search term
  const [cartCount, setCartCount] = useState(0); // State to hold number of items in the cart
  const { data: items, error, isLoading } = useGetItems(); // Fetching items
  const { isAvailable } = useGetKitchenStatus(); // Fetching kitchen status
  const [isModalOpen, setIsModalOpen] = useState(false); // State to show/hide the modal
  const registerUser = useRegisterUser();
  // Load cart count from localStorage on mount
  useEffect(() => {
    const storedCart: Item[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalItems = storedCart.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    setCartCount(totalItems); // Set initial cart count
  }, []);

  // Show modal when the restaurant is closed
  useEffect(() => {
    setIsModalOpen(!isAvailable);
  }, [isAvailable]);

  // Update the search term
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear the search term
  const handleClear = () => {
    setSearchTerm("");
  };

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      const generateUUID = () => {
        // If the browser supports crypto API
        if (window.crypto && window.crypto.getRandomValues) {
          let array = new Uint32Array(4);
          window.crypto.getRandomValues(array);
          let uuid = "";
          for (let i = 0; i < array.length; i++) {
            uuid += array[i].toString(16).padStart(8, "0");
          }
          return uuid;
        } else {
          // Fallback for older browsers
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
              let r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            }
          );
        }
      };

      const userId = generateUUID();
      localStorage.setItem("user", userId);
      console.log(userId);

      // Call the registerUser mutation
      registerUser.mutate({ uid: userId });
    }
  }, [registerUser]);
  // Add item to cart
  const handleAddToCart = (item: Item, quantityChange: number = 1) => {
    const storedCart: Item[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = storedCart.find(
      (cartItem) => cartItem._id === item._id
    );

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity ?? 0) + quantityChange;
      // If quantity becomes zero, remove item
      if (existingItem.quantity <= 0) {
        const index = storedCart.findIndex(
          (cartItem) => cartItem._id === item._id
        );
        storedCart.splice(index, 1);
      }
    } else {
      storedCart.push({ ...item, quantity: quantityChange });
    }

    localStorage.setItem("cart", JSON.stringify(storedCart)); // Update local storage

    // Update cart count
    const totalItems = storedCart.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0
    );
    setCartCount(totalItems); // Update state with the new cart count
  };

  // Remove item from cart
  const handleRemoveFromCart = (item: Item) => {
    const storedCart: Item[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCart = storedCart.filter(
      (cartItem) => cartItem._id !== item._id
    );

    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update local storage

    // Update cart count
    const totalItems = updatedCart.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0
    );
    setCartCount(totalItems); // Update state with the new cart count
  };

  // Filter and slice items based on the search term
  const filteredItems =
    items?.filter((item: Item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Slice the filtered items array if needed
  // const slicedItems = filteredItems.slice(0, 10); // Change 10 to your desired slice size

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8 bg-white shadow">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Shiv Dhaba" className="h-10 w-auto" />
          <span className="ml-2 text-xl font-semibold">Shiv Restaurant</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="relative flex items-center">
            <ShoppingCartIcon className="w-6 h-6 text-black" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {/*  */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="items-center justify-center">
                <AvatarImage className="w-8 h-8" src={user} />
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="cursor-pointer">
                <NavLink to="/order-history">Order History</NavLink>
              </DropdownMenuItem>
              {/* <DropdownMenuItem className="cursor-pointer">Billing</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
          {/*  */}
        </div>
      </header>

      <Modal isOpen={isModalOpen} />

      <div className="flex justify-center mt-4 px-8">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search food you like..."
            value={searchTerm}
            onChange={handleSearch}
            className="block w-full p-4 pl-10 text-sm border border-black rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={handleClear}
            >
              <XIcon className="w-5 h-5 text-muted-foreground" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
          {searchTerm && filteredItems.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1">
              {filteredItems.map((item: Item, index: number) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Menu</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error loading items: {error.message}</p>
          ) : (
            filteredItems.map((item: Item) => (
              <MenuCard
                key={item._id}
                item={item}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
              />
            ))
          )}
        </div>
      </main>
      {/* make a footer here */}
      <footer className="bg-white  py-6 mt-auto">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row justify-center gap-2 md:gap-3 items-center">
          <p className="text-sm text-center md:text-left mb-0 md:mb-0">
            Get you own app and website like this.
          </p>
          <a
            href="tel:+918595257175"
            className="bg-blue-600 text-white text-sm font-semibold flex gap-2 py-2 px-4 items-center justify-center rounded-full hover:bg-blue-500 transition duration-300"
          >
            <div>Call Now</div>
            <Phone size={15} />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
