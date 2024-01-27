import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";

const LandingPage = () => {
  return (
    <div>
      <p>Landing Page</p>
      <Button>C</Button>
      <UserButton afterSignOutUrl="/"></UserButton>
      <ModeToggle />
    </div>
  );
};
export default LandingPage;
