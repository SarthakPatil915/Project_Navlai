import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TreePine, Users, Target, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            About Navlai
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
            Navlai is a community-driven platform dedicated to organizing and promoting 
            social awareness events that make a real difference in our communities.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white">
              <CardHeader>
                <TreePine className="h-10 w-10 text-neutral-700" />
                <CardTitle className="mt-4">Environmental Action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Organizing tree plantation drives and cleanup campaigns to protect our environment.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <Users className="h-10 w-10 text-neutral-700" />
                <CardTitle className="mt-4">Community Building</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Bringing people together to create lasting connections and shared purpose.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <Target className="h-10 w-10 text-neutral-700" />
                <CardTitle className="mt-4">Awareness Drives</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Educating communities about important social and environmental issues.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <Heart className="h-10 w-10 text-neutral-700" />
                <CardTitle className="mt-4">Health Camps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Organizing health checkups and wellness programs for underserved communities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Our Story</h2>
            <div className="mt-6 space-y-4 text-neutral-600">
              <p>
                Navlai was founded with a simple belief: that meaningful change happens when 
                communities come together with shared purpose. What started as a small group 
                organizing local tree plantation drives has grown into a platform connecting 
                thousands of volunteers across multiple cities.
              </p>
              <p>
                Our platform makes it easy for organizations and individuals to create, 
                discover, and participate in social awareness events. From environmental 
                initiatives to education workshops, we believe every action counts.
              </p>
              <p>
                Today, we're proud to have facilitated hundreds of events, planted thousands 
                of trees, and most importantly, built a community of changemakers who are 
                committed to making a positive impact in their neighborhoods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-neutral-900 sm:text-3xl">
            Our Values
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-neutral-900">Transparency</h3>
              <p className="mt-2 text-neutral-600">
                We believe in open communication and accountability in everything we do.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-neutral-900">Inclusivity</h3>
              <p className="mt-2 text-neutral-600">
                Everyone is welcome to participate and contribute to our mission.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-neutral-900">Impact</h3>
              <p className="mt-2 text-neutral-600">
                We focus on creating measurable, lasting change in our communities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
