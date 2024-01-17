// The following code is written in TypeScript and uses React hooks for state management.
// It also uses the Next.js Image component for optimized image handling.
// The main functionality of the code is to take a user's input, send it to an API for processing,
// and then display the results. The results are images generated based on the user's input.
// The code also handles various states of the application, such as loading, error, and success states.

// The following line is used to set the client-side environment
'use client'

// Importing necessary libraries and components
// useState is a Hook that lets you add React state to function components
import { JSX, SVGProps, useState } from 'react';

// Next.js's Image component is an extension of the HTML <img> element, evolved for the modern web.
import Image from 'next/image'

// Button, Label, Input, Skeleton are custom UI components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Progress } from "@/components/ui/progress"


// ReloadIcon is an icon component
import { DownloadIcon, UpdateIcon } from "@radix-ui/react-icons"

// Logo, Dialog, Bg are custom components
import Logo from "@/components/logos/logo"

// Bars3Icon, XMarkIcon are icon components
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Bg from '@/components/bg/bg';


// sleep is a utility function that pauses execution for a specified time
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const currentYear = new Date().getFullYear();

// Prediction is an interface that defines the shape of prediction data
interface Prediction {
  output: string[];
  status: string;
  id: string;
  detail?: string;
}

// Main function component
export default function Home() {

  // State variables for message, translated data and audio source
  // useState returns a stateful value, and a function to update it.
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0)

  // prediction and error are state variables that hold prediction data and error message respectively
  const [predictionOn, setPredictionOn] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to handle input change and set message state
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  // Function to handle button click and perform translation
  const handleButtonClick = async () => {
    if (message) {

      setError(null);
      if (message.length > 2000) {
        setError('Your message exceeds the 2000 characters limit. Please shorten your message and try again.');
        return;
      }

      setPredictionOn(true);

      const prompt = 'in the style of TOK,' + message + ' as a tattoo';


      // Adding message as a param
      const apiRoute = `/api/prediction`;


      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ message: prompt }),
      };
      try {
        // Fetching response from API
        let response = await fetch(apiRoute, options);
        if (!response.ok) {
          if (response.status === 429) {
            setError('You have reached your request limit of 5 for the hour. Try again after sometime.');
            setPredictionOn(false);
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

        }
        // Parsing response data
        let prediction = await response.json();


        if (response.status !== 201) {
          setError(prediction.detail);
          setPredictionOn(false);
          return;
        }



        if (!!prediction) {
          // Setting translated data state
          setPrediction(prediction);
          // Calling text to speech function
          let predictionsIdUrl = "/api/predictionState" + "/" + prediction.id;

          let progressValue = 1;
          setProgress(0);
          const progressInterval = setInterval(() => {
            if (progressValue <= 100) {
              setProgress(progressValue++);
            } else {
              clearInterval(progressInterval);
            }
          }, 750);

          while (
            prediction.status !== "succeeded" &&
            prediction.status !== "failed"
          ) {
            await sleep(2000);
            response = await fetch(predictionsIdUrl);
            prediction = await response.json();
            if (response.status !== 200) {
              setError(prediction.detail);
              return;
            }
            setPrediction(prediction);
            if (prediction.status === "succeeded") {
              clearInterval(progressInterval);
              setProgress(100);
              setPredictionOn(false);
            }

          }

        } else {
          setPrediction(null);
          setPredictionOn(false);
        }

      } catch (error) {
        setPredictionOn(false);
        if (error instanceof Error) {
          console.log('There was a problem with the fetch operation: ' + error.message);
        }
      }

    } else {
      setError('No text entered. Please enter a prompt and try again.');

    }
  };

  const downloadImage = async (src: string) => {
    // Adjust for relative path
    if (!src.startsWith('http')) {
      src = `${window.location.origin}${src}`;
    }

    const response = await fetch(src);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const footer = [

    {
      name: 'GitHub',
      href: 'https://github.com/vetri02/tattoo-ideas',
      icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },

  ]

  // ImageComponent is a React functional component. It takes src, pos, title, and prompt as props and returns an Image component.
  const ImageComponent = ({ src, pos, title, prompt }: { src: string, pos: string, title?: string, prompt?: string }) => (
    <Dialog>
      <DialogTrigger asChild>
        <div className={`relative aspect-[9/10] w-44 flex-none overflow-hidden rounded-xl bg-zinc-100  border-2 border-white sm:w-72 sm:rounded-2xl rotate-0 sm:${pos} sm:hover:rotate-0`}>
          <Image
            alt="Predictions"
            loading="lazy"
            width={640}
            height={640}
            src={src}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w">
        <DialogHeader>
          <DialogTitle>Tattoo Idea {title}</DialogTitle>
          {prompt && <DialogDescription>
            <span className='font-semibold'>Prompt:</span> {prompt}
          </DialogDescription>}
        </DialogHeader>
        <AspectRatio ratio={4 / 5}>
          <Image
            alt="Predictions"
            width={640}
            height={640}
            src={src}
            priority={true}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AspectRatio>
        <DialogFooter>
          <Button onClick={() => downloadImage(src)}>
            <DownloadIcon className="mr-2 h-4 w-4" /> Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  );

  // Rendering component
  return (

    <div className="relative min-h-screen">

      <Bg className="absolute inset-0 w-full" />

      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <span className="sr-only">AI Tattoo Generator</span>
            <Logo className="inline-block h-6 w-auto" />
          </div>
        </nav>
      </header>

      <main className="relative isolate overflow-hidden pt-14">

        <div className="mx-auto  py-32 sm:py-48">

          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl leading-16">
              AI Tattoo Generator
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl text-center mx-auto p-4">
              Discover the art of the future with AI Tattoo Generator, your personal artist for digitally crafted, bespoke tattoo designs.
            </p>
            <div className="mt-8 flex items-center justify-center">
              <div className="w-full max-w-lg items-center pt-8 pb-2 px-4">
                <Input type="text" id="message" onChange={handleInputChange} placeholder="Eg.: Tiger on the horizon" />
                <p className="text-sm text-red-600 pt-2">
                  {error}
                </p>
                <Button onClick={handleButtonClick} disabled={predictionOn} className='mt-4 w-full sm:w-1/3'>
                  {predictionOn && <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />}
                  Go
                </Button>
                {predictionOn && <p className="text-sm pt-2">This may take at least 60 seconds. Please wait...
                </p>}

              </div>

            </div>
            {prediction && prediction.status !== "succeeded" &&

              <div className="mt-16 sm:mt-20">
                <div className="-my-4 flex flex-wrap  justify-center gap-3 sm:gap4 overflow-hidden py-4 sm:gap-8">
                  <Skeleton className="relative aspect-[9/10] w-44 flex items-center justify-center h-full overflow-hidden rounded-xl border-2 border-white sm:w-72 sm:rounded-2xl rotate-0 sm:rotate-2 sm:hover:rotate-0" >
                    <Progress value={progress} className='w-full h-full rounded-none' />
                  </Skeleton>
                  <Skeleton className="relative aspect-[9/10] w-44 flex items-center justify-center h-full overflow-hidden rounded-xl border-2 border-white sm:w-72 sm:rounded-2xl rotate-0 sm:-rotate-2 sm:hover:rotate-0" >
                    <Progress value={progress} className='w-full h-full rounded-none' />
                  </Skeleton>
                  <Skeleton className="relative aspect-[9/10] w-44 flex items-center justify-center h-full overflow-hidden rounded-xl border-2 border-white sm:w-72 sm:rounded-2xl rotate-0 sm:rotate-2 sm:hover:rotate-0" >
                    <Progress value={progress} className='w-full h-full rounded-none' />
                  </Skeleton>
                  <Skeleton className="relative aspect-[9/10] w-44 flex items-center justify-center h-full overflow-hidden rounded-xl border-2 border-white sm:w-72 sm:rounded-2xl rotate-0 sm:rotate-2 sm:hover:rotate-0" >
                    <Progress value={progress} className='w-full h-full rounded-none' />
                  </Skeleton>

                </div>
              </div>

            }


            {prediction && prediction.output &&
              <div className="mt-16 sm:mt-20">
                <div className="-my-4 flex flex-wrap  justify-center gap-3 sm:gap4 overflow-hidden py-4 sm:gap-8">
                  <ImageComponent src={prediction.output[prediction.output.length - 1]} pos='rotate-2' title='1' />
                  <ImageComponent src={prediction.output[prediction.output.length - 2]} pos='-rotate-2' title='2' />
                  <ImageComponent src={prediction.output[prediction.output.length - 3]} pos='rotate-2' title='3' />
                  <ImageComponent src={prediction.output[prediction.output.length - 4]} pos='rotate-2' title='4' />
                </div>
              </div>
            }

            {!prediction &&
              <div className="mt-16 sm:mt-20">
                <div className="-my-4 flex flex-wrap  justify-center gap-3 sm:gap4 overflow-hidden py-4 sm:gap-8">
                  <ImageComponent src='/images/dog.webp' pos='rotate-2' title='1' prompt='A golden retriever portrait as a tattoo in the arm' />
                  <ImageComponent src='/images/panda.webp' pos='-rotate-2' title='2' prompt='Panda on the arm' />
                  <ImageComponent src='/images/tiger.webp' pos='rotate-2' title='3' prompt='Tiger on the arm' />
                  <ImageComponent src='/images/samurai.webp' pos='rotate-2' title='4' prompt='Samurai on back' />
                </div>
              </div>
            }
          </div>
        </div>
<h1 class="text-4xl font-bold text-center mb-6">AI Tattoo Generator: A New Way to Design and Express Yourself Through Tattoos</h1>
  <p class="text-gray-700 text-lg mb-4">Tattoo art has evolved remarkably over the years. From ancient tribal symbols to modern graphic designs, the journey has been long and diverse. Today, we're witnessing a new chapter in this evolution: the rise of AI in tattoo design. AI tattoo generators are changing how we think about and create tattoos.</p>
  <p class="text-gray-700 text-lg mb-4">They blend technology with art, offering a fresh perspective on personal expression. These generators use advanced algorithms to turn ideas into visual masterpieces. This shift is not just a trend. It's a significant leap in the tattooing process.</p>
  <p class="text-gray-700 text-lg mb-4">In this guide, we'll look into AI tattoo generators. We'll explore how they work and why they're gaining popularity. Plus, we'll look at the best options, helping you find the perfect AI tattoo generator for your next ink.</p>
  <h2 class="text-3xl font-bold my-4">What Are AI Tattoo Generators?</h2>
  <p class="text-gray-700 text-lg mb-4">AI tattoo generators are innovative tools that merge technology and art to revolutionize tattoo design. These generators use artificial intelligence to convert ideas, words, and concepts into tangible, visual designs. But how exactly do they work?</p>
  <p class="text-gray-700 text-lg mb-4">These generators employ complex algorithms that can interpret user input, whether it's a text description, a theme, or even mood words. They analyze this input to understand the desired style, elements, and aesthetics of the tattoo. Once the AI grasps the essence of what is sought, it employs generative models to represent these ideas visually.</p>
  <p class="text-gray-700 text-lg mb-4">The magic of AI tattoo generators lies in their learning capabilities. They are trained on vast databases of tattoo designs, artistic styles, and visual patterns. This training allows them to generate various designs, from traditional to contemporary, abstract to realistic.</p>
  <p class="text-gray-700 text-lg mb-4">Users can often fine-tune their designs by adjusting parameters like color, complexity, and size, making each design highly customizable and unique.</p>
  <p class="text-gray-700 text-lg mb-4">Another remarkable aspect of these generators is their ability to adapt to different body parts and shapes. They can simulate how a tattoo will look on various body parts, taking into account the curves and contours, ensuring that the final design is aesthetically pleasing and harmonious with the body's natural form.</p>
  <h2 class="text-3xl font-bold my-4">Rising Popularity</h2>
  <p class="text-gray-700 text-lg mb-4">The popularity of AI tattoo generators is steadily increasing, and it's easy to see why. The primary appeal lies in their ability to democratize the design process. Creating a unique tattoo design is no longer solely the domain of those with artistic skills or deep pockets. Now, anyone with a concept can turn their vision into a tangible design.</p>
  <p class="text-gray-700 text-lg mb-4">This accessibility is a game-changer. It empowers individuals to experiment with their ideas freely, without the commitment of a permanent tattoo or the expense of a professional designer. It's particularly appealing to those who might be hesitant or unsure about what design they want, offering a risk-free way to explore different styles and concepts.</p>
  <p class="text-gray-700 text-lg mb-4">Social media has played a significant role in this surge of interest. Platforms like Instagram and Pinterest are flooded with AI-generated tattoo designs, inspiring others to explore this new world of body art. The sharing of these designs creates a community of enthusiasts, further fueling the popularity of these generators.</p>
  <p class="text-gray-700 text-lg mb-4">Lastly, the advancement in AI technology is a driving force behind this trend. As AI becomes more sophisticated, so does its ability to create intricate, beautiful designs that resonate with people's desires and imaginations.</p>
  <p class="text-gray-700 text-lg mb-4">This technological leap is not just a fad; it's a sign of a new era in tattoo artistry, blending the old with the new, the traditional with the cutting-edge.</p>
  <h2 class="text-3xl font-bold my-4">Top 7 AI Tattoo Generators</h2>
  <h3 class="text-2xl font-semibold my-3">BlackInk AI</h3>
  <p class="text-gray-700 text-lg mb-4"><a href="https://blackink.ai/">BlackInk AI</a> is a unique tattoo generator that sets itself apart from others in the market. It is designed for tattoo lovers who want to create custom and unique designs quickly. The user-friendly platform makes it easy to design your tattoos in seconds.&nbsp;</p>
  <p class="text-gray-700 text-lg mb-4">This can be a real game-changer for those browsing Pinterest and Instagram for tattoo inspiration.&nbsp;</p>
  <p class="text-gray-700 text-lg mb-4">BlackInk AI offers several unique features, such as access to millions of AI-generated tattoo designs, simplifying the design process from start to finish, free credits to start creating, and the ability to get a temporary tattoo to see how the design looks on the skin before making it permanent.&nbsp;</p>
  <p class="text-gray-700 text-lg mb-4">You can also download a high-resolution version of your final design to take to your tattoo artist for final adjustments and inking.</p>
  <h3 class="text-2xl font-semibold my-3">InkTune</h3>
  <p class="text-gray-700 text-lg mb-4"><a href="https://inktune.com/">InkTune</a> is revolutionizing the way we think about tattoo design. This AI tattoo generator stands out for its unique approach to creating body art. It's not just another tattoo site; it's a game-changer. Using advanced AI algorithms, InkTune crafts personalized tattoo designs that align perfectly with your style.</p>
  <p class="text-gray-700 text-lg mb-4">What makes InkTune unique is its AI-powered design process. It analyzes your preferences to create customized tattoos that resonate with your style. This means each design is as unique as the person wearing it.&nbsp;</p>
  <p class="text-gray-700 text-lg mb-4">The user-friendly platform makes it easy for anyone to start designing their tattoo. Plus, you can begin exploring your ideas without any upfront costs.&nbsp;</p>
  <p class="text-gray-700 text-lg mb-4">InkTune is more than just a tattoo generator; as an AI Tattoo Generator, it represents a significant leap in how we think about and create tattoos, making the process more accessible, personalized, and creative.&nbsp;</p>
  <h3 class="text-2xl font-semibold my-3">NightCafe Creator</h3>
  <p class="text-gray-700 text-lg mb-4"><a href="https://creator.nightcafe.studio/">NightCafe Creator</a> stands out as a unique AI Tattoo Generator, offering a blend of art and technology. This platform allows users to create stunning artwork in seconds using Artificial Intelligence.&nbsp;</p>
  <p class="text-gray-700 text-lg mb-4">What sets NightCafe apart is its vibrant AI Art community, where millions engage in creating, sharing, and discussing AI art. The tool is incredibly user-friendly, enabling even those without artistic skills to generate impressive designs.&nbsp;</p>
  <p class="text-gray-700 text-lg mb-4">NightCafe offers a variety of AI algorithms, including Stable Diffusion and DALL-E 2, providing a wide range of artistic styles. Additionally, it's free to use with unlimited base Stable Diffusion generations.&nbsp;</p>
  <p class="text-gray-700 text-lg mb-4">The platform is accessible on both web and mobile, making it convenient for users to create and review their designs from any device. NightCafe's unique features, such as multiple style images, bulk creation, and custom seeds, make it a standout choice for anyone exploring the world of AI-generated tattoo designs.</p>
  <h3 class="text-2xl font-semibold my-3">InkHunter</h3>
  <p class="text-gray-700 text-lg mb-4"><a href="https://www.inkhunter.tattoo/">InkHunter</a> is an innovative AI tattoo generator that goes beyond design creation. It uses augmented reality (AR) to show users how a tattoo will look on their body before they get inked. This feature is handy for those who need help with their tattoo's placement or size.</p>
  <p class="text-gray-700 text-lg mb-4">With InkHunter, you can upload your design or choose from various AI-generated tattoos. The AR technology then projects the tattoo onto your skin through your smartphone's camera, providing a realistic preview of the outcome.&nbsp;</p>
  <p class="text-gray-700 text-lg mb-4">This technology is beneficial for visualizing how a design will conform to the contours of your body, making it easier to decide on the perfect spot for your new ink.</p>
  <h3 class="text-2xl font-semibold my-3">Tattoos AI</h3>
  <p class="text-gray-700 text-lg mb-4"><a href="https://www.tattoosai.com/">TattoosAI</a> is another innovative player in the world of AI tattoo generators. This platform takes personalization to the next level. By combining the power of AI with user input, Tattoos AI creates visually stunning designs that are deeply meaningful to the individual.</p>
  <p class="text-gray-700 text-lg mb-4">One of the standout features of Tattoos AI is its intuitive interface. It's incredibly user-friendly, making it easy for anyone to navigate and create, regardless of their tech-savviness.&nbsp;</p>
  <p class="text-gray-700 text-lg mb-4">The platform is designed to understand and translate complex ideas into beautiful, artistic representations. Whether you're looking for something symbolic, text-based, or purely aesthetic, Tattoos AI can bring your vision to life.</p>
  <p class="text-gray-700 text-lg mb-4">Another notable aspect of Tattoosai.com is its flexibility in design. It allows users to experiment with different styles, colors, and placements, providing a realistic preview of how the tattoo will look on the skin. This feature is beneficial for those still deciding or wanting to try various options before settling on the final design.</p>
  <h3 class="text-2xl font-semibold my-3">Art Guru</h3>
  <p class="text-gray-700 text-lg mb-4">Art Guru takes AI tattoo generation into the realm of high art. This platform is ideal for those who appreciate artistic expression's finer details and subtleties. Art Guru's AI is trained in classical and contemporary art styles, enabling it to generate designs that are not just tattoos but art pieces.</p>
  <p class="text-gray-700 text-lg mb-4">The strength of Art Guru lies in its sophisticated algorithm that understands and replicates different art movements and styles. Whether you're inspired by Renaissance art, Abstract Expressionism, or modern minimalism, Art Guru can craft a tattoo design that reflects these influences.</p>
  <p class="text-gray-700 text-lg mb-4">Furthermore, Art Guru offers a unique feature that allows users to upload images of artwork or patterns they admire. The AI then incorporates elements from these inspirations into a custom tattoo design. This feature particularly appeals to art enthusiasts who wish to carry a piece of art history with them.</p>
  <h3 class="text-2xl font-semibold my-3">Anime Genius</h3>
  <p class="text-gray-700 text-lg mb-4">Anime Genius is a specialized AI tattoo generator for anime and manga fans. This platform stands out for its deep understanding and interpretation of anime-style artwork. It's the perfect tool for those who want to infuse their tattoos with the distinctive aesthetics of Japanese animation.</p>
  <p class="text-gray-700 text-lg mb-4">Anime Genius's AI is trained on a vast database of anime and manga art, ensuring that each design it generates is authentic to the genre's unique visual style. Whether you're looking for a tattoo that captures the essence of a beloved character, a specific scene, or simply the artistic flair of anime, Anime Genius can create it for you.</p>
  <p class="text-gray-700 text-lg mb-4">What sets Anime Genius apart is its ability to accurately replicate the anime art style, including its vibrant color schemes, exaggerated expressions, and dynamic compositions. This makes it an ideal choice for die-hard anime fans who want their tattoos to be true to the source material.</p>
  <p class="text-gray-700 text-lg mb-4">In addition to its style-specific capabilities, Anime Genius also offers customization options. Users can tweak elements like color palettes, character poses, and background details to ensure their tattoo is a masterpiece.&nbsp;</p>
  <p class="text-gray-700 text-lg mb-4">This level of customization is particularly appealing to those who want a tattoo that is not just an anime design but a personal statement.</p>
  <h2 class="text-3xl font-bold my-4">Your Ink, Your Story, Your Choice</h2>
  <p class="text-gray-700 text-lg mb-4">In tattoos, AI tattoo generators are a big step forward. They offer a new way to think about and create tattoos. With these tools, you can make designs that are indeed yours. They help you show who you are through ink. It's not just about following trends. It's about making tattoos that mean something to you.</p>
  <p class="text-gray-700 text-lg mb-4">The future of tattooing is exciting. Technology and personal style are coming together. This means more choices and better ways to express yourself.</p>
  <p class="text-gray-700 text-lg mb-4">Whether you're a first-timer or a tattoo enthusiast, AI tattoo generators open up a world of possibilities. Your next tattoo could be just a few clicks away. Remember, it's your story. Tell it in your way, with a design that's as unique as you are.</p>
      </main>
      <footer>
        <div className="mx-auto border-t border-gray-400/10 max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            {footer.map((item) => (
              <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
          {/* <div className="mt-8 md:order-1 md:mt-0">
            <div className="text-center text-xs leading-5 text-gray-500">
              Powered by
              {" "}
              <a href="https://replicate.com/" target="_blank" className="font-bold hover:underline transition hover:text-gray-300 underline-offset-2">
                Replicate
              </a>
              {" "}
              and
              {" "}
              <a href="https://vercel.com/" target="_blank" className="font-bold hover:underline transition hover:text-gray-300 underline-offset-2">
                Vercel
              </a>
            </div>
          </div> */}
          <div className="mt-8 md:order-1 md:mt-0 text-xs text-center md:text-left leading-5 text-gray-500">
            Created by {" "}
            <a href="https://github.com/vetri02" target="_blank" className="font-bold hover:underline transition hover:text-gray-300 underline-offset-2">
              vetri02
            </a>
          </div>
          
        </div>
      </footer>

    </div>




  )
}






