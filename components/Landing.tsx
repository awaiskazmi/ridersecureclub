import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

const Landing = () => {
  return (
    <>
      <section className="md:py-22">
        <div className="grid md:grid-cols-2 gap-7">
          <div className="flex flex-col gap-7">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
              Find, book and
              <br />
              rent a car <strong className="text-purple-700">Easily</strong>
            </h1>
            <p className="text-secondary-foreground md:pr-32">
              Experience secure and reliable car rental services designed for
              comfort and peace of mind. Choose from a wide range of
              well-maintained vehicles for daily, weekly, or monthly rentals.
            </p>
            <div className="flex gap-3">
              {/* <Button size="lg" asChild>
                <Link href="/terms">Terms of use</Link>
              </Button> */}
              <Button size="lg" asChild>
                <Link href="/privacy-policy">Privacy policy</Link>
              </Button>
            </div>
          </div>
          <div className="flex w-[125%]">
            <Image
              src={"/car.png"}
              width={720}
              height={720}
              className="w-full"
              alt="Picture of car"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Landing;
