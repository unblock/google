class Solution(object):
    def reverse(self, x):
        m=2147483647 
        s=str(x)
        if(x>=0):
            s=s[::-1]
            ans=int(s)
            if(ans>m): ans=0
            return ans
        else:
            s=s[1:]
            s=s[::-1]
            ans=int(s)
            if(ans>m): ans=0
            return -ans
        """
        :type x: int
        :rtype: int
        """