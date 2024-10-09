'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'
import { SearchOutlined } from '@ant-design/icons'
import { useToast } from "../../hooks/use-toast"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent } from "../../components/ui/card"


const Logo: React.FC<{ height?: number }> = ({ height = 40 }) => (
  <div style={{ height }}>
    <span className="text-2xl font-bold text-red-600">Sonder</span>
  </div>
)

export default function ApprovedSchoolsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: schools, isLoading } = api.profile.approvedSchools.useQuery()
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  
  const [applicationForm, setApplicationForm] = useState({
    schoolName: '',
    domain: '',
    contactEmail: '',
    additionalInfo: '',
  })
  const { toast } = useToast()

  const applicationMutation = api.profile.submitSchoolApplication.useMutation({
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
        variant: "default",
      })
      setIsApplicationModalOpen(false)
      setApplicationForm({
        schoolName: '',
        domain: '',
        contactEmail: '',
        additionalInfo: '',
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault()
    applicationMutation.mutate(applicationForm)
  }

  const filteredSchools = schools?.filter(school => 
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.domain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-black text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="text-center mb-16">
          <Logo height={80} />
          <h1 className="text-4xl lg:text-5xl font-bold lg:tracking-tight mt-4 mb-4">
            Approved Universities
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Below is our list of approved institutions. 
          </p>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4">
            Dont see your university? Apply to have it added to our platform.
          </p>
          <Button
            onClick={() => setIsApplicationModalOpen(true)}
            className="px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Apply to Add Your University
          </Button>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for universities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-5 bg-gray-900 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-slate-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools?.map((school) => (
              <Card key={school.id} className="bg-gray-900 hover:bg-gray-800 transition-colors border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-xl text-white font-bold">
                        {school.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg text-white font-semibold">{school.name}</h3>
                      <p className="text-sm text-slate-400">{school.domain}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
          <DialogContent className="bg-gray-900 text-white border-gray-700 sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Apply to Add Your University</DialogTitle>
              <DialogDescription className="text-slate-400">
                Fill out the form below to submit your university for approval.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitApplication} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="schoolName" className="text-sm font-medium text-slate-200">University Name</Label>
                <Input
                  id="schoolName"
                  value={applicationForm.schoolName}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, schoolName: e.target.value }))}
                  className="w-full bg-gray-800 text-white border-gray-700 focus:ring-red-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain" className="text-sm font-medium text-slate-200">University Email Domain</Label>
                <Input
                  id="domain"
                  value={applicationForm.domain}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="example.edu"
                  className="w-full bg-gray-800 text-white border-gray-700 focus:ring-red-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-medium text-slate-200">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={applicationForm.contactEmail}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full bg-gray-800 text-white border-gray-700 focus:ring-red-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo" className="text-sm font-medium text-slate-200">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={applicationForm.additionalInfo}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  className="w-full bg-gray-800 text-white border-gray-700 focus:ring-red-500"
                  rows={4}
                />
              </div>
           
              <DialogFooter className="sm:flex-row flex-col space-y-2 sm:space-y-0 sm:space-x-2 pt-6">
                <Button
                  type="button"
                  onClick={() => setIsApplicationModalOpen(false)}
                  variant="outline"
                  className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={applicationMutation.isPending}
                  className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto"
                >
                  {applicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {filteredSchools?.length === 0 && (
          <div className="text-center text-slate-400 mt-8">
            No universities found matching your search.
          </div>
        )}
      </div>
    </main>
  )
}