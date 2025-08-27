// Composants de l'interface secrétaire
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PacteManagement } from "./PacteManagement";
import { TeacherOverview } from "./TeacherOverview";
import { ValidationInterface } from "./ValidationInterface";
import { ArchiveManager } from "./ArchiveManager";
import { useSession } from "@/hooks/use-session";

export function SecretaryView() {
  // Utiliser les vraies données des sessions
  const { sessions } = useSession();

  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      {/* Navigation principale */}
      <div className="bg-white p-4 rounded-lg shadow">
        <Tabs
          defaultValue="dashboard"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="validate">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4"/>
                <path d="M12 2c-.8 0-1.6.2-2.3.6a10 10 0 0 0-6.1 6.1 10 10 0 0 0 0 6.6 10 10 0 0 0 6.1 6.1 10 10 0 0 0 6.6 0 10 10 0 0 0 6.1-6.1 10 10 0 0 0 0-6.6 10 10 0 0 0-6.1-6.1A9.5 9.5 0 0 0 12 2z"/>
              </svg>
              Validation
            </TabsTrigger>
            <TabsTrigger value="teachers">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m22 2 5-5"/>
                <path d="m17 7 5 5"/>
              </svg>
              Enseignants
            </TabsTrigger>
            <TabsTrigger value="pacte">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m22 2-5 10-3-3-2 2"/>
              </svg>
              PACTE
            </TabsTrigger>
            <TabsTrigger value="archives">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="4" rx="1"/>
                <rect x="4" y="7" width="16" height="13" rx="1"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              Archives
            </TabsTrigger>
            <TabsTrigger value="history">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3m-3-10a9 9 0 1 0 9 9m0-14v5h-5"/>
              </svg>
              Historique
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tableau de bord</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-blue-700">
                              {sessions.filter(s => s.status === 'PENDING_REVIEW').length}
                            </div>
                            <div className="text-sm text-blue-600">À réviser</div>
                          </div>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-orange-700">
                              {sessions.filter(s => s.status === 'PENDING_VALIDATION').length}
                            </div>
                            <div className="text-sm text-orange-600">En validation</div>
                          </div>
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-green-700">
                              {sessions.filter(s => s.status === 'VALIDATED').length}
                            </div>
                            <div className="text-sm text-green-600">Validées</div>
                          </div>
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-purple-700">
                              {sessions.filter(s => s.status === 'PAID').length}
                            </div>
                            <div className="text-sm text-purple-600">Payées</div>
                          </div>
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Séances récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Enseignant</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.slice(0, 5).map(session => (
                        <TableRow key={session.id}>
                          <TableCell>{session.teacherName}</TableCell>
                          <TableCell>{session.date}</TableCell>
                          <TableCell>
                            <Badge className={
                              session.type === 'RCD' ? 'bg-purple-100 text-purple-800' :
                              session.type === 'DEVOIRS_FAITS' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }>
                              {session.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              session.status === 'VALIDATED' ? 'bg-green-100 text-green-800' :
                              session.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800' :
                              session.status === 'PENDING_VALIDATION' ? 'bg-blue-100 text-blue-800' :
                              session.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              session.status === 'PAID' ? 'bg-purple-100 text-purple-800' : ''
                            }>
                              {session.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="validate">
            <ValidationInterface />
          </TabsContent>

          <TabsContent value="teachers">
            <TeacherOverview />
          </TabsContent>

          <TabsContent value="pacte">
            <div className="space-y-6">
              <PacteManagement />
              <TeacherOverview />
            </div>
          </TabsContent>

          <TabsContent value="archives">
            <ArchiveManager sessions={sessions} />
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des validations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Enseignant</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Détails</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions
                        .filter(session => session.status !== 'PENDING_VALIDATION')
                        .map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>{session.teacherName}</TableCell>
                          <TableCell>{session.date}</TableCell>
                          <TableCell>
                            <Badge className={
                              session.type === 'RCD' ? 'bg-purple-100 text-purple-800' :
                              session.type === 'DEVOIRS_FAITS' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }>
                              {session.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {session.type === 'RCD' && (
                              <span>Classe {session.className}, {session.replacedTeacherName}</span>
                            )}
                            {session.type === 'DEVOIRS_FAITS' && (
                              <span>{session.gradeLevel} - {session.studentCount} élèves</span>
                            )}
                            {session.type === 'AUTRE' && (
                              <span>{session.description}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              session.status === 'VALIDATED' ? 'bg-green-100 text-green-800' :
                              session.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              session.status === 'PAID' ? 'bg-purple-100 text-purple-800' : ''
                            }>
                              {session.status === 'VALIDATED' ? 'Validée' :
                               session.status === 'REJECTED' ? 'Rejetée' :
                               session.status === 'PAID' ? 'Payée' : session.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {sessions.filter(session => session.status !== 'PENDING_VALIDATION').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                            Aucun historique disponible
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Exporter en CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}