import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useRouter } from 'next/navigation'

export default function Widgets() {
  const router = useRouter()
  const trendingTopics = ['#UniversityLife', '#StudyTips', '#CampusEvents']
  const upcomingEvents = [
    { name: 'Career Fair', date: 'Next Week' },
    { name: 'Hackathon', date: 'This Weekend' },
    { name: 'Guest Lecture', date: 'Tomorrow' },
  ]

  return (
    <aside className="w-80 hidden lg:block space-y-6">
      <Card className="p-4 bg-slate-900 border border-slate-800 shadow-lg">
        <h2 className="font-semibold mb-3 text-lg text-white">Trending Topics</h2>
        <ul className="space-y-2">
          {trendingTopics.map((topic) => (
            <li key={topic} className="text-slate-400 hover:text-white cursor-pointer transition-colors duration-200">
              {topic}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4 bg-slate-900 border border-slate-800 shadow-lg">
        <h2 className="font-semibold mb-3 text-lg text-white">Upcoming Events</h2>
        <ul className="space-y-2">
          {upcomingEvents.map((event) => (
            <li key={event.name} className="flex justify-between items-center">
              <span className="text-slate-400">{event.name}</span>
              <span className="text-sm text-slate-500">{event.date}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4 bg-slate-900 border border-slate-800 shadow-lg">
        <h2 className="font-semibold mb-3 text-lg text-white">Find Friends</h2>
        <Button onClick={()=> router.push("/swipe")} className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-200">
          Connect with Classmates
        </Button>
      </Card>
    </aside>
  )
}