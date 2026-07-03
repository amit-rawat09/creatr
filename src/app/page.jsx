"use client";
import MouseMove from "@/components/MouseMove";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  features,
  platformTabs,
  socialProofStats,
  testimonials,
} from "@/lib/data";
import { ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="fixed inset-0 bg-linear-to-br from-purple-900/20 via-blue-900/20 to-green-900/20 animate-pulse" />
      <MouseMove />
      <section className="relative z-10 mt-48 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-7xl lg:text-8xl font-black leading-none tracking-tight">
                <span className="block font-black text-white">Create.</span>
                <span className="block font-light italic text-purple-300">
                  Publish.
                </span>
                <span className="block font-black bg-linear-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                  Grow.
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 font-light leading-relaxed max-w-2xl md:max-w-none">
                The AI-powered platform that turns your ideas into{" "}
                <span className="text-purple-300 font-semibold">
                  engaging content
                </span>{" "}
                and help you build a thriving creator business
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start">
              <Link href="/dashboard">
                <Button
                  size="xl"
                  variant="primary"
                  className="rounded-full w-full sm:w-auto text-white"
                >
                  Start Creating for Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/feed">
                <Button
                  size="xl"
                  variant="outline"
                  className="rounded-full w-full sm:w-auto"
                >
                  Explore the feed
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="">
            <Image
              src="/banner.png"
              alt="Plateform Banner"
              width={500}
              height={700}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative mt-14 z-10 py-16 sm:py-24 px-4 sm:px-6 bg-linear-to-r from-gray-900/50 to-purple-900/20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
              <span className="gradient-text-primary">
                {" "}
                Everything you need
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              From AI-powered writing assistance to advance analytics,
              we&apos;ve built the complete toolkit for modern creators.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="group transition-all duration-300 hover:scale-105 card-glass"
              >
                <CardContent>
                  <div
                    className={`w-12 h-12 sm:w-16 bg-linear-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl mb-3 sm:mb-4 text-white">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-gray-400">
                    {feature.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
              <span className="gradient-text-primary"> How it works</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              Three powerful modules working together to supercharge your
              content creation.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <div className="space-y-4">
                {platformTabs.map((tab, index) => (
                  <Button
                    className="w-full justify-start h-auto p-6"
                    key={index}
                    variant={activeTab === index ? "outline" : "ghost"}
                    onClick={() => setActiveTab(index)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeTab == index ? "bg-linear-to-br from bg-purple-500 to-blue-500" : "bg-muted"}`}
                      >
                        <tab.icon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-lg">{tab.title}</h3>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="lg:w-2/3">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>{platformTabs[activeTab].title}</CardTitle>
                  <CardDescription>
                    {platformTabs[activeTab].description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {platformTabs[activeTab].features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 text-center shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 bg-linear-to-r from-gray-900/50 to-purple-900/20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-12 sm:mb-16">
            <span className="gradient-text-primary">
              {" "}
              Loved by creators worldwide
            </span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">
          {socialProofStats.map((stat, index) => (
            <div key={index} className="flex flex-col text-center">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-linear-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center sm:mb-4 mb-3 mx-auto`}
              >
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 gradient-text-accent">
                {stat.metric}
              </div>
              <div className="text-gray-400 text-base sm:text-lg">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6" id="testimonial">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 text-center">
          <span className="gradient-text-primary"> What Creators say</span>
        </h2>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {testimonials.map((test, idx) => (
            <div
              key={idx}
              className="bg-gray-900/60 border border-gray-800 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]"
            >
              <div className="flex justify-start gap-5 mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  <Image
                    src={test.imageId}
                    alt={test.name}
                    width={100}
                    height={100}
                    className="rounded-full object-cover "
                  />
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold">{test.name}</h3>
                  <p className="text-purple-400">{test.role}</p>
                  <p className="text-gray-500 text-sm">{test.company}</p>
                </div>
              </div>

              <div className="flex justify-center gap-1 text-yellow-400 mb-5">
                {"⭐".repeat(test.rating)}
              </div>

              <p className="text-gray-300 text-center leading-7 italic mb-6">
                "{test.content}"
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-rfrom-gray-900/50
to-purple-900/20"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 sm:mb-8">
            <span className="gradient-text-primary">Ready to create?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Join thousands of creators who are already building their audience
            and growing their business with our AI-powered platform.
          </p>{" "}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/dashboard">
              <Button
                size="xl"
                variant="primary"
                className="rounded-full text-white w-full"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/feed">
              <Button
                variant="outline"
                size="xl"
                className="rounded-full w-full"
              >
                Explore the Feed
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
