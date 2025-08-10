import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  Award, 
  Languages, 

  Stethoscope,
  Building2,
  User
} from "lucide-react";
import { DoctorSuggestion } from "@/services/referralAnalysis";
import { toast } from "@/hooks/use-toast";

interface DoctorSuggestionsProps {
  suggestions: DoctorSuggestion[];
  onBookAppointment: (doctorId: string, slot: { date: string; startTime: string; endTime: string }) => void;
  isLoading?: boolean;
  selectedFacilityId?: string;
}

const DoctorSuggestions: React.FC<DoctorSuggestionsProps> = ({
  suggestions,
  onBookAppointment,
  isLoading = false,
  selectedFacilityId
}) => {
  const [selectedSlots, setSelectedSlots] = useState<{ [doctorId: string]: number }>({});

  const handleSlotSelect = (doctorId: string, slotIndex: number) => {
    setSelectedSlots(prev => ({
      ...prev,
      [doctorId]: slotIndex
    }));
  };

  const handleBooking = (doctor: DoctorSuggestion) => {
    const selectedSlotIndex = selectedSlots[doctor.doctor.id];
    if (selectedSlotIndex !== undefined && doctor.availableSlots[selectedSlotIndex]) {
      onBookAppointment(doctor.doctor.id, doctor.availableSlots[selectedSlotIndex]);
      toast({
        title: "Booking Initiated",
        description: `Proceeding to book appointment with ${doctor.doctor.title} ${doctor.doctor.name}`,
      });
    } else {
      toast({
        title: "Please select a time slot",
        description: "Choose an available appointment time before booking.",
        variant: "destructive",
      });
    }
  };


  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return "bg-green-100 text-green-800";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">AI is analyzing your referral letter...</h3>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No doctor suggestions available</h3>
          <p className="text-muted-foreground">
            We couldn't find suitable doctors at the moment. Please try again later or contact our support team.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Recommended Doctors</h3>
        <Badge variant="secondary" className="px-3 py-1">
          {suggestions.length} doctors found
        </Badge>
      </div>

      <div className="grid gap-6">
        {suggestions.map((suggestion, index) => (
          <Card key={suggestion.doctor.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              {/* Match Score - Top Banner */}
              <div className={`-mt-6 -mx-6 mb-4 py-2 px-4 text-center ${getMatchScoreColor(suggestion.matchScore)}`}>
                <span className="text-lg font-semibold">{Math.round(suggestion.matchScore * 100)}% match</span>
                {index === 0 && (
                  <span className="ml-2 inline-flex items-center">
                    <Star className="w-4 h-4 mr-1" fill="currentColor" />
                    Best Match
                  </span>
                )}
                {/* Show practice locations */}
                <div className="text-sm mt-2">
                  {selectedFacilityId ? (
                    // Show schedule type for selected facility
                    <div className="flex items-center justify-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.is_primary ? (
                        <span className="text-primary font-medium">Primary Location</span>
                      ) : (
                        <span className="text-muted-foreground capitalize">
                          {suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.schedule_type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  ) : (
                    // Show all practice locations
                    <div className="flex flex-col items-center gap-1">
                      {suggestion.locations.map(location => (
                        <div key={location.id} className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span className={location.is_primary ? "text-primary font-medium" : ""}>
                            {location.facility.name}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            ({location.schedule_type.replace('_', ' ')})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Doctor Info */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  <AvatarImage src={suggestion.doctor.profileImageUrl} />
                  <AvatarFallback className="bg-primary/10 text-lg">
                    {getInitials(suggestion.doctor.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl">
                      {suggestion.doctor.title} {suggestion.doctor.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base mt-1">
                      <Stethoscope className="w-5 h-5" />
                      {suggestion.specialty.name}
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm sm:text-base">
                    <Badge variant="outline" className="flex items-center gap-1 py-1">
                      <Award className="w-4 h-4" />
                      {suggestion.doctor.experienceYears} years experience
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              {/* Match Reason */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm sm:text-base text-blue-800">
                  <strong>Why this doctor:</strong> {suggestion.matchReason}
                </p>
              </div>

              {/* Doctor Details */}
              <div className="bg-muted/20 rounded-lg p-4 space-y-6">
                {/* Facility Info */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 mt-1 text-primary" />
                    <div className="flex-1">
                      {selectedFacilityId ? (
                        <>
                          <p className="font-medium text-base">
                            {suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.facility.name}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.facility.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant={suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.is_primary ? "default" : "outline"} className="ml-2 mt-1">
                            {suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.is_primary ? "PRIMARY" : 
                             suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.schedule_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-base">
                            {suggestion.locations.find(l => l.is_primary)?.facility.name || suggestion.locations[0]?.facility.name}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {(suggestion.locations.find(l => l.is_primary)?.facility.type || suggestion.locations[0]?.facility.type).replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="default" className="ml-2 mt-1">PRIMARY</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-8 space-y-2">
                    {selectedFacilityId ? (
                      <>
                        <a 
                          href={`https://maps.google.com/?q=${suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.facility.address},${suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.facility.city}`}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="text-sm sm:text-base text-primary hover:text-primary/80 flex items-start gap-2"
                        >
                          <MapPin className="w-4 h-4 mt-1 shrink-0" />
                          <span>
                            {suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.facility.address}, 
                            {suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.facility.city}
                          </span>
                        </a>
                        
                        {suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.facility.phone && (
                          <a 
                            href={`tel:${suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.facility.phone}`}
                            className="text-sm sm:text-base text-primary hover:text-primary/80 flex items-center gap-2"
                          >
                            <Phone className="w-4 h-4" />
                            <span>{suggestion.locations.find(l => l.facility_id === selectedFacilityId)?.facility.phone}</span>
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        <a 
                          href={`https://maps.google.com/?q=${suggestion.locations.find(l => l.is_primary)?.facility.address || suggestion.locations[0]?.facility.address},${suggestion.locations.find(l => l.is_primary)?.facility.city || suggestion.locations[0]?.facility.city}`}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="text-sm sm:text-base text-primary hover:text-primary/80 flex items-start gap-2"
                        >
                          <MapPin className="w-4 h-4 mt-1 shrink-0" />
                          <span>
                            {suggestion.locations.find(l => l.is_primary)?.facility.address || suggestion.locations[0]?.facility.address}, 
                            {suggestion.locations.find(l => l.is_primary)?.facility.city || suggestion.locations[0]?.facility.city}
                          </span>
                        </a>
                        
                        {(suggestion.locations.find(l => l.is_primary)?.facility.phone || suggestion.locations[0]?.facility.phone) && (
                          <a 
                            href={`tel:${suggestion.locations.find(l => l.is_primary)?.facility.phone || suggestion.locations[0]?.facility.phone}`}
                            className="text-sm sm:text-base text-primary hover:text-primary/80 flex items-center gap-2"
                          >
                            <Phone className="w-4 h-4" />
                            <span>{suggestion.locations.find(l => l.is_primary)?.facility.phone || suggestion.locations[0]?.facility.phone}</span>
                          </a>
                        )}
                      </>
                    )}
                  </div>

                  {/* Show all practice locations when no specific facility is selected */}
                  {!selectedFacilityId && suggestion.locations.length > 1 && (
                    <div className="mt-4 border-t pt-4">
                      <h5 className="text-sm font-medium mb-2">All Practice Locations:</h5>
                      <div className="space-y-3">
                        {suggestion.locations.filter((_, i) => i > 0).map(location => (
                          <div key={location.id} className="flex items-start gap-2">
                            <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                <span className={location.is_primary ? "font-medium" : ""}>
                                  {location.facility.name}
                                </span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {location.schedule_type.replace('_', ' ')}
                                </Badge>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {location.facility.address}, {location.facility.city}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Languages */}
                  {suggestion.doctor.languages.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2 text-base">
                        <Languages className="w-5 h-5 text-primary" />
                        Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.doctor.languages.map((lang) => (
                          <Badge key={lang} variant="outline" className="py-1 px-2 text-sm">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Qualifications */}
                  {suggestion.doctor.qualifications.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2 text-base">
                        <User className="w-5 h-5 text-primary" />
                        Qualifications
                      </h4>
                      <div className="flex flex-col gap-2">
                        {suggestion.doctor.qualifications.map((qual, idx) => (
                          <Badge key={idx} variant="secondary" className="py-1 px-2 text-sm w-fit">
                            {qual}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {suggestion.doctor.bio && (
                <div className="bg-muted/10 p-4 rounded-lg">
                  <p className="text-sm sm:text-base text-muted-foreground">{suggestion.doctor.bio}</p>
                </div>
              )}

              <Separator className="my-2" />

              {/* Available Slots */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  Available Appointments
                </h4>
                
                {suggestion.availableSlots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {suggestion.availableSlots.map((slot, slotIndex) => (
                      <Button
                        key={slotIndex}
                        variant={selectedSlots[suggestion.doctor.id] === slotIndex ? "default" : "outline"}
                        onClick={() => handleSlotSelect(suggestion.doctor.id, slotIndex)}
                        className={`h-auto p-4 ${
                          selectedSlots[suggestion.doctor.id] === slotIndex
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex flex-col items-start w-full">
                          <span className="font-medium text-base">
                            {new Date(slot.date).toLocaleDateString('en-MY', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <span className="text-sm mt-1 flex items-center gap-2 opacity-90">
                            <Clock className="w-4 h-4" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">No available slots in the next 7 days.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DoctorSuggestions;
