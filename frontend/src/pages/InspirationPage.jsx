import inspiration1 from '@/assets/img1.jpeg'
import inspiration2 from '@/assets/img2.jpeg'
import inspiration3 from '@/assets/img3.jpeg'
import inspiration4 from '@/assets/img4.jpeg'
import inspiration5 from '@/assets/img5.jpeg'
import inspiration6 from '@/assets/img6.jpeg'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User, Leaf, Award, Globe, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store'

const inspirations = [
  {
    img: inspiration1,
    title: 'Green Yatra: Living The Dream Of Planting 10 Crore Trees By 2025',
    desc: `Founded in 2010 by Pradeep Tripathi, Green Yatra is a Mumbai-based NGO on a mission to leave the world better than they found it. Their flagship campaign, 'Pedh Lagao', enables individuals and corporates to plant trees across India. Each sapling is nurtured for three years by a dedicated team of green warriors. To date, Green Yatra has planted over 1.3 lakh trees and aims for 10 crore by 2025.`,
    icon: Leaf,
    tag: 'Environment',
    author: 'Pradeep Tripathi',
  },
  {
    img: inspiration2,
    title: 'CybageAsha: Empowering Rural India',
    desc: `CybageAsha, the philanthropic arm of Cybage Software (Pune), has been driving social change since 2005. Their initiatives span rural upliftment (building roads, drainage), water conservation (desilting, group wells, biogas), community support (emergency blood donations, employee volunteering), and education. Their work, especially in Pune district, is a model for sustainable, community-driven development.`,
    icon: Users,
    tag: 'Community',
    author: 'CybageAsha Team',
  },
  {
    img: inspiration3,
    title: 'Worm Rani: Urban Composting Champion',
    desc: `Vani Murthy, known as Worm Rani, is a 60-year-old homemaker-turned-changemaker inspiring urban youth to compost and manage waste sustainably. Through her engaging videos, she demystifies composting and empowers city dwellers to take up eco-friendly waste management at home.`,
    icon: Award,
    tag: 'Sustainability',
    author: 'Vani Murthy',
  },
  {
    img: inspiration4,
    title: 'Malhar Kalambe: Beach Please Movement',
    desc: `Malhar Kalambe, founder of Beach Please, leads one of India's largest youth-driven environmental communities. What began as a small Dadar Beach cleanup in 2017 has become a massive movement, with weekly cleanups at Mumbai's beaches and the Mithi River. Over 8.5 million kg of garbage have been removed. Malhar is a UN Volunteer for Change and won the National Creators Award for "Sustainable Creator of the Year" in 2024.`,
    icon: Globe,
    tag: 'Youth',
    author: 'Malhar Kalambe',
  },
  {
    img: inspiration5,
    title: 'Habitat for Humanity: Building Hope Worldwide',
    desc: `Habitat for Humanity is a global non-profit dedicated to building homes, communities, and hope. Since 1976, it has helped over 65 million people in 70+ countries access safe, affordable housing, transforming lives and neighborhoods through the power of collective action.`,
    icon: User,
    tag: 'Global',
    author: 'Habitat for Humanity',
  },
  {
  img: inspiration6,
  title: 'Sidiously: Transforming Social Media Influence Into Real-World Impact',
  desc: `Siddhesh Lokare, popularly known as Sidiously, is a leading Indian social impact storyteller, content creator, and entrepreneur. Through his powerful digital presence, he drives large-scale humanitarian initiatives across India. His viral campaign 'Mission 30303' aimed to raise ₹3 crore in 30 days to transform 30 under-resourced rural schools in Maharashtra. With a community of over 1.8 million followers, he has helped raise more than ₹7 crore for various social causes. Siddhesh is the Founder of Kindly Club and serves as Director at CreateTogether Foundation, focusing on education and student empowerment. In December 2025, he received the Influencer for a Social Cause Award at the Crystal Shine Awards for his outstanding contributions.`,
  icon: Users,
  tag: 'Social Impact',
  author: 'Siddhesh Lokare',
},
]

export default function InspirationPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const handleJoinNow = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="mb-14 text-center">
        <h1 className="text-4xl font-bold text-neutral-900 mb-3 tracking-tight sm:text-5xl">Inspiration</h1>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-neutral-600">
          Meet the changemakers and organizations who are transforming communities and the environment. Their stories inspire us to act, innovate, and create a better world—one step at a time.
        </p>
      </section>

      {/* Inspiration Cards Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {inspirations.map((item, idx) => {
          const Icon = item.icon
          return (
            <Card
              key={idx}
              className="group relative flex flex-col overflow-hidden border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              {/* Image with overlay */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-transparent to-transparent" />
                <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-800 shadow-sm backdrop-blur">
                  <Icon className="h-4 w-4 text-green-600" />
                  {item.tag}
                </span>
              </div>
              <CardContent className="flex flex-1 flex-col p-6">
                <h2 className="mb-2 text-lg font-semibold text-neutral-900 group-hover:text-green-700 transition-colors min-h-[3rem]">{item.title}</h2>
                <p className="mb-4 text-neutral-700 leading-relaxed line-clamp-5">{item.desc}</p>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 border border-neutral-200">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="text-sm text-neutral-600 font-medium">{item.author}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* CTA Section */}
      <section className="mt-16 text-center">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">Ready to be the next inspiration?</h3>
        <p className="mb-6 text-neutral-600 max-w-xl mx-auto">
          Start your own journey of change. Join our community and make a difference today.
        </p>
        <Button
          size="lg"
          variant="default"
          className="px-8 py-3 text-base font-semibold"
          onClick={handleJoinNow}
        >
          Join Now
        </Button>
      </section>
    </div>
  )
}
