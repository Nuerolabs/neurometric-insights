import React from 'react';
import { Search, Inbox, Clock, CheckCircle, Archive, MoreHorizontal, Paperclip, Send, User, Phone, Mail, Building, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ConversationsPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-white font-sans text-sm border-t border-slate-200 overflow-hidden">
      {/* Sidebar - Folders */}
      <div className="w-64 border-r border-slate-200 bg-slate-50/50 flex flex-col">
        <div className="p-4">
          <h2 className="font-semibold text-slate-800">Inbox</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start font-medium text-slate-700 bg-slate-200/50">
              <Inbox className="mr-2 h-4 w-4" /> Unassigned
              <Badge className="ml-auto bg-blue-600 hover:bg-blue-700 text-white border-transparent">24</Badge>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900">
              <User className="mr-2 h-4 w-4" /> Assigned to me
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900">
              <Clock className="mr-2 h-4 w-4" /> Snoozed
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900">
              <CheckCircle className="mr-2 h-4 w-4" /> Closed
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900">
              <Archive className="mr-2 h-4 w-4" /> Spam
            </Button>
          </nav>
        </div>
      </div>

      {/* Conversation List */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              type="search" 
              placeholder="Search messages..." 
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500" 
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {/* Item 1 */}
            <button className="flex flex-col items-start gap-2 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left bg-blue-50/50 relative">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600"></div>
              <div className="flex w-full justify-between items-center">
                <span className="font-semibold text-slate-900">Acme Corp</span>
                <span className="text-xs text-slate-500">10:42 AM</span>
              </div>
              <div className="text-xs font-medium text-slate-700">Contract Negotiation</div>
              <div className="text-xs text-slate-500 line-clamp-2 w-full">
                Could we review the terms in section 4? We have some concerns regarding the liability clause.
              </div>
              <div className="flex gap-1 mt-1">
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal border-slate-200 text-slate-600">High Priority</Badge>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal border-slate-200 text-slate-600">Sales</Badge>
              </div>
            </button>
            
            {/* Item 2 */}
            <button className="flex flex-col items-start gap-2 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left">
              <div className="flex w-full justify-between items-center">
                <span className="font-medium text-slate-700">Sarah Jenkins</span>
                <span className="text-xs text-slate-500">Yesterday</span>
              </div>
              <div className="text-xs font-medium text-slate-700">Login Issues</div>
              <div className="text-xs text-slate-500 line-clamp-2 w-full">
                I haven't been able to log in since the update yesterday. My password reset link isn't working.
              </div>
            </button>

            {/* Item 3 */}
            <button className="flex flex-col items-start gap-2 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left">
              <div className="flex w-full justify-between items-center">
                <span className="font-medium text-slate-700">Global Tech</span>
                <span className="text-xs text-slate-500">Tue</span>
              </div>
              <div className="text-xs font-medium text-slate-700">Quarterly Review Setup</div>
              <div className="text-xs text-slate-500 line-clamp-2 w-full">
                Just confirming our meeting for Thursday. I will send the agenda shortly.
              </div>
            </button>
          </div>
        </ScrollArea>
      </div>

      {/* Main Conversation View */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-blue-100 text-blue-700">AC</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-slate-900">Acme Corp</h2>
              <p className="text-xs text-slate-500">Contract Negotiation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 border-slate-200 text-slate-600">
              <CheckCircle className="h-4 w-4 mr-1.5" /> Resolve
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Message Thread */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Date Separator */}
            <div className="flex justify-center">
              <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                Today, October 24th
              </span>
            </div>

            {/* Inbound Message */}
            <div className="flex gap-4">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">MR</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-slate-900">Michael Ross</span>
                  <span className="text-xs text-slate-400">10:42 AM</span>
                </div>
                <div className="bg-slate-100 text-slate-800 p-3 rounded-lg rounded-tl-none text-sm border border-slate-200/50">
                  <p>Hi team,</p>
                  <p className="mt-2">Could we review the terms in section 4? We have some concerns regarding the liability clause and would like to propose a cap at $1M.</p>
                  <p className="mt-2">Please let me know if this is something we can discuss on a quick call later today.</p>
                </div>
              </div>
            </div>

            {/* Outbound Message */}
            <div className="flex gap-4 flex-row-reverse">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-blue-600 text-white text-xs">ME</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 max-w-[80%] items-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">10:45 AM</span>
                  <span className="font-medium text-sm text-slate-900">You</span>
                </div>
                <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tr-none text-sm shadow-sm">
                  <p>Hi Michael,</p>
                  <p className="mt-2">Thanks for reaching out. I'll need to check with our legal team regarding the liability cap.</p>
                  <p className="mt-2">I'll get back to you within the next hour to schedule a call if needed.</p>
                </div>
              </div>
            </div>
            
            {/* Internal Note */}
            <div className="flex justify-center my-4">
              <div className="bg-yellow-50/80 border border-yellow-200/60 rounded-md p-3 w-3/4 flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-yellow-200/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-yellow-800">Sys</span>
                </div>
                <div className="text-sm text-yellow-800">
                  <span className="font-semibold">Note added by Legal Team:</span> We can accept a $1M cap, but only if they agree to the standard net-30 payment terms in section 5.
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Reply Composer */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all bg-slate-50/50 shadow-sm">
            <textarea 
              className="w-full min-h-[100px] p-3 bg-transparent resize-none focus:outline-none text-sm text-slate-900 placeholder:text-slate-400"
              placeholder="Type your reply..."
            />
            <div className="flex items-center justify-between p-2 bg-white border-t border-slate-100">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-slate-500 hover:text-slate-700 text-xs font-medium">
                  Use Template
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 text-xs font-medium">
                  Add Internal Note
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-8 shadow-sm">
                  Send <Send className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Context/Details */}
      <div className="w-72 border-l border-slate-200 bg-slate-50/30 hidden lg:flex flex-col text-sm">
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-200">
              <Avatar className="h-16 w-16 mb-3">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">AC</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-slate-900 text-base">Acme Corp</h3>
              <p className="text-slate-500 text-xs mt-1">Enterprise Customer</p>
            </div>

            <div className="py-6 border-b border-slate-200 space-y-4">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Contact Details</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-xs truncate">michael.ross@acmecorp.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-xs">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Building className="h-4 w-4 text-slate-400" />
                  <span className="text-xs">acmecorp.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-xs">New York, NY</span>
                </div>
              </div>
            </div>

            <div className="py-6 space-y-4">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Recent Activity</h4>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-xs font-medium text-slate-800">Viewed Contract v2</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Today, 10:30 AM</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-slate-300"></div>
                  <div>
                    <p className="text-xs font-medium text-slate-800">Meeting with Sales</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Oct 20, 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
